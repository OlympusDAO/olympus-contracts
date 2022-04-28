// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "../libraries/SafeERC20.sol";
import "../interfaces/IERC20.sol";
import "../types/BaseAllocator.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";
import "../interfaces/ITokemakRewards.sol";

error TokeMakAllocator_NoTokensFound();
error TokeMakAllocator_ContractHasNoBalance();
error TokeMakAllocator_InvalidAmountsLength();
error TokeMakAllocator_ReactorAddressNotApproved();
error TokeMakAllocator_StakingDepositedCallDeallocate();
error TokeMakAllocator_CallUpdateClaimInfoFunctionFirst();
error TokeMakAllocator_OtherTokensInContractUseDeallocate();
error TokeMakAllocator_RequestedWithdrawCycleNotReachedYet();

interface ITokemakManager {
    function getCurrentCycleIndex() external view returns (uint256);
}

interface ITokemakVote {
    /// @notice Vote payload to be submitted to Vote Tracker
    struct UserVotePayload {
        address account;
        bytes32 voteSessionKey;
        uint256 nonce;
        uint256 chainId;
        uint256 totalVotes;
        UserVoteAllocationItem[] allocations;
    }

    struct UserVoteAllocationItem {
        bytes32 reactorKey;
        uint256 amount; //18 Decimals
    }

    function vote(UserVotePayload memory _userVotePayload) external;
}

interface ITokemaktReactor {
    function deposit(uint256 amount) external;

    function requestedWithdrawals(address addr) external view returns (uint256, uint256);

    function withdraw(uint256 requestedAmount) external;

    function requestWithdrawal(uint256 amount) external;

    function requestWithdrawal(uint256 amount, uint256 scheduleIdx) external;

    function balanceOf(address account) external view returns (uint256);

    function availableForWithdrawal(address account, uint256 scheduleIndex) external view returns (uint256);

    function withdrawalRequestsByIndex(address account, uint256 scheduleIndex) external view returns (uint256, uint256);
}

contract TokeMakAllocator is BaseAllocator {
    using SafeERC20 for IERC20;

    // Tokemak staking deposit contract
    ITokemaktReactor public staking;

    uint8 public v;
    uint256 public tokenCount;
    uint256 public claimedAmount;

    address public voting;
    address public rewards;
    address public manager;
    address public treasury;
    address public immutable toke;

    bytes32 r;
    bytes32 s;

    struct TokenInfo {
        uint256 amountAllocated;
        uint256 totalDeposited;
        address reactor;
    }

    mapping(uint256 => ITokemakRewards.Recipient) public claimInfo;
    mapping(uint256 => TokenInfo) public tokenInfo;

    constructor(
        address _voting,
        address _staking,
        address _rewards,
        address _manager,
        address _treasury,
        AllocatorInitData memory data
    ) BaseAllocator(data) {
        require(_voting != address(0));
        require(_staking != address(0));
        require(_rewards != address(0));
        require(_manager != address(0));
        require(_treasury != address(0));

        voting = _voting;
        rewards = _rewards;
        manager = _manager;
        treasury = _treasury;
        toke = address(data.tokens[0]);

        // approve for safety, yes toke is being instantly sent to treasury and that is fine
        // but to be absolutely safe this one approve won't hurt
        IERC20(toke).approve(address(extender), type(uint256).max);
        tokenInfo[tokenCount].reactor = _staking;
        tokenCount++;
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        ITokemakRewards.Recipient memory recipient = claimInfo[0];

        if (recipient.amount <= claimedAmount) revert TokeMakAllocator_CallUpdateClaimInfoFunctionFirst();
        else ITokemakRewards(rewards).claim(recipient, v, r, s);

        claimedAmount = recipient.amount;

        // only focused on compounding tokemak token since all reactors gets rewards in toke
        uint256 tokemakBalance = IERC20(toke).balanceOf(address(this));

        if (tokemakBalance > 0) {
            deposit(tokemakBalance, toke, tokenInfo[0].reactor, 0);
        }

        uint128 total = uint128(tokenInfo[0].totalDeposited);
        uint128 last = extender.getAllocatorPerformance(id).gain + uint128(extender.getAllocatorAllocated(id));

        if (total >= last) gain = total - last;
        else loss = last - total;
    }

    function _deactivate(bool panic) internal override {
        if (panic) {
            // If panic unstake everything

            if (_tokens.length != 1 || _tokens.length != 0) {
                // Sends all tAssets to the treasury given whoever holds the tAssets
                // can withdraw the underlying token value
                for (uint256 i = 1; i < _tokens.length + 1; i++) {
                    uint256 balance = IERC20(tokenInfo[i].reactor).balanceOf(address(this));

                    IERC20(tokenInfo[i].reactor).safeTransfer(treasury, balance);
                    tokenInfo[i].amountAllocated -= balance;

                    // Remove all tokens with tAssets token leaving just tokemak token
                    _tokens.pop();
                    tokenCount--;
                }
            }

            if (_tokens.length == 0) revert TokeMakAllocator_NoTokensFound();

            // Given tokemak token staking pool doesn't give a tAsset token we can only request for withdrawal here
            uint256[] memory amounts = new uint256[](1);
            amounts[0] = ITokemaktReactor(tokenInfo[0].reactor).availableForWithdrawal(address(this), 0);

            // Have to call deallocate again once withdrawal cycle is reached to withdraw
            deallocate(amounts);
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amounts = new uint256[](_tokens.length);

        for (uint256 i; i < _tokens.length; i++) {
            if (amountAllocated(i) != 0) revert TokeMakAllocator_StakingDepositedCallDeallocate();
            amounts[i] = 0;
        }
        deallocate(amounts);
    }

    /// @notice as structured by Tokemak before one withdraws you must first request withdrawal, unstake staking from Alchemix staking pool, depending on the nature of the function call, make a request on Tokemak staking pool.
    /// @param _amount amount to withdraw, if uint256 max then take all
    /// @param _reactor address of reactor to interact with
    /// @param _isStaking indicator if reactor is tokemak staking
    function requestWithdraw(
        uint256 _amount,
        address _reactor,
        bool _isStaking
    ) internal {
        if (_isStaking) ITokemaktReactor(_reactor).requestWithdrawal(_amount, 0);
        else ITokemaktReactor(_reactor).requestWithdrawal(_amount);
    }

    /// @notice withdraws TOKE from Tokemak staking pool to the contract address, ensures cycle for withdraw has been reached.
    /// @param _reactor address of reactor to interact with
    /// @param _id id of added reactor
    /// @param _isStaking indicator if reactor is tokemak staking
    function withdraw(
        address _reactor,
        uint256 _id,
        bool _isStaking
    ) internal {
        (, uint256 requestedAmountToWithdraw) = getRequestedWithdrawalInfo(_reactor, _isStaking);
        ITokemaktReactor(_reactor).withdraw(requestedAmountToWithdraw);
        tokenInfo[_id].totalDeposited -= requestedAmountToWithdraw;
    }

    function name() external pure override returns (string memory) {
        return "TokeMakAllocator";
    }

    // allocator specific

    /**
     * @notice Set the address of one of the dependencies (external contracts) this contract uses.
     * @param _contractNumber 0 for `treasury`, 1 for `manager`, 2 for `voting` and all else is for `rewards`
     */
    function setExternalContract(address _newAddress, uint256 _contractNumber) external onlyGuardian {
        if (_contractNumber == 0) treasury = _newAddress;
        else if (_contractNumber == 1) manager = _newAddress;
        else if (_contractNumber == 2) voting = _newAddress;
        else rewards = _newAddress;
    }

    function vote(ITokemakVote.UserVotePayload calldata _userVotePayload) external onlyGuardian {
        ITokemakVote(voting).vote(_userVotePayload);
    }

    function approveToken(address _token, address _reactor) external onlyGuardian {
        _tokens.push(IERC20(_token));
        tokenInfo[tokenCount].reactor = _reactor;

        IERC20(_token).approve(address(extender), type(uint256).max);
        tokenCount++;
    }

    /// @notice Given rewards are distributed every week with a new IPFS hash which requires downloading the payload via an api,
    /// this function help makes claiming rewards possible where the _info is gotten offchain and uploaded onchain
    /// @param _info Published rewards payload
    /// @param _v v component of the payload signature
    /// @param _r r component of the payload signature
    /// @param _s s component of the payload signature
    function updateClaimInfo(
        ITokemakRewards.Recipient calldata _info,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external onlyGuardian {
        claimInfo[0] = ITokemakRewards.Recipient({
            chainId: _info.chainId,
            cycle: _info.cycle,
            wallet: _info.wallet,
            amount: _info.amount
        });

        v = _v;
        r = _r;
        s = _s;
    }

    /// @notice used after calling the deactivate and deallocate to send tokemak token to treasury
    function withdrawToke() external onlyGuardian {
        if (_tokens.length != 1) revert TokeMakAllocator_OtherTokensInContractUseDeallocate();
        uint256 tokemakBalance = IERC20(toke).balanceOf(address(this));

        if (tokemakBalance == 0) revert TokeMakAllocator_ContractHasNoBalance();
        IERC20(toke).safeTransfer(treasury, tokemakBalance);
    }

    ///  @notice There is two step process to withdraw from this allocator, first a withdrawal is requested and secondly
    /// the tokens are actually withdrawn, but this takes time hence the request.
    ///
    /// @param _amounts Pass in _amounts[i] = 0 to claim, and _amounts[i] > 0 to request. Amount length is tied to _tokens.length.
    function deallocate(uint256[] memory _amounts) public override onlyGuardian {
        if (_amounts.length == 0) revert TokeMakAllocator_InvalidAmountsLength();

        for (uint256 i; i < _tokens.length; i++) {
            bool isStaking = i == 0 ? true : false;

            if (_amounts[i] == 0) {
                (uint256 minCycle, ) = getRequestedWithdrawalInfo(tokenInfo[i].reactor, isStaking);
                uint256 currentCycle = ITokemakManager(manager).getCurrentCycleIndex();

                if (minCycle > currentCycle) revert TokeMakAllocator_RequestedWithdrawCycleNotReachedYet();
                withdraw(tokenInfo[i].reactor, i, isStaking);
            } else {
                requestWithdraw(_amounts[i], tokenInfo[i].reactor, isStaking);
                tokenInfo[i].amountAllocated -= _amounts[i];
            }
        }
    }

    /**
     * @notice Returns amount of currently allocated TOKE.
     */
    function amountAllocated(uint256 _id) public view override returns (uint256) {
        return tokenInfo[_id].amountAllocated;
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory reward = new IERC20[](1);
        reward[0] = IERC20(toke);
        return reward;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        return _tokens;
    }

    /// @notice query requested withdrawal info
    /// @param _reactor address of reactor to interact with
    /// @param _isStaking indicator if reactor is tokemak staking
    /// @return cycle eligible for withdrawal and amount
    function getRequestedWithdrawalInfo(address _reactor, bool _isStaking)
        public
        view
        returns (uint256 cycle, uint256 amount)
    {
        if (_isStaking) (cycle, amount) = ITokemaktReactor(_reactor).withdrawalRequestsByIndex(address(this), 0);
        else (cycle, amount) = ITokemaktReactor(_reactor).requestedWithdrawals(address(this));
    }

    /// @notice Deposits asset into Tokemak staking, then deposits staking into Alchemix staking pool
    /// @param _amount amount to deposit
    /// @param _token ERC20 token
    /// @param _reactor address of reactor to interact with
    /// @param _id id of added reactor
    function deposit(
        uint256 _amount,
        address _token,
        address _reactor,
        uint256 _id
    ) public onlyGuardian {
        if (tokenInfo[_id].reactor != _reactor) revert TokeMakAllocator_ReactorAddressNotApproved();
        IERC20(_token).approve(_reactor, _amount); // approve tokemak pool to spend tokens

        ITokemaktReactor(_reactor).deposit(_amount);
        tokenInfo[_id].totalDeposited += _amount;
        tokenInfo[_id].amountAllocated += _amount;
    }
}
