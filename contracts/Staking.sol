// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IsOHM.sol";
import "./interfaces/IgOHM.sol";
import "./interfaces/IDistributor.sol";

import "./types/OlympusAccessControlled.sol";

/// @title   OlympusStaking contract
/// @author  Olympus
/// @notice  Users stake OHM => sOHM or gOHM
contract OlympusStaking is OlympusAccessControlled {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;
    using SafeERC20 for IgOHM;

    /// EVENTS ///

    /// @notice Emitted when distributor is updated
    /// @param distributor Address of distributor
    event DistributorSet(address distributor);

    /// @notice Emitted when warmup is set
    /// @param warmup Amount of time new stakers spend in warmup
    event WarmupSet(uint256 warmup);

    /// STRUCTS ///

    /// @notice            Parameters of the current epoch
    /// @param length      Length in seconds of the current epoch
    /// @param number      Number epoch that the current epoch is
    /// @param end         Timestamp of when current epoch ends
    /// @param distribute  Amount of OHM to distirbute at the end of the epoch
    struct Epoch {
        uint256 length;
        uint256 number;
        uint256 end;
        uint256 distribute;
    }

    /// @notice         Parameters of a user's stake that is in the warmup contract
    /// @param deposit  User's OHM deposit
    /// @param gons     User's staked balance of OHM
    /// @param expiry   Timestamp warmup period is over
    /// @param lock     Prevents malicious delays for claim
    struct Claim {
        uint256 deposit;
        uint256 gons;
        uint256 expiry;
        bool lock;
    }

    /// STATE VARIABLES ///

    IERC20 public immutable OHM;
    IsOHM public immutable sOHM;
    IgOHM public immutable gOHM;
    IDistributor public distributor;

    Epoch public epoch;

    uint256 public warmupPeriod;
    uint256 private gonsInWarmup;

    mapping(address => Claim) public warmupInfo;

    /* ========== CONSTRUCTOR ========== */

    /// @param _ohm               Address of the OHM token
    /// @param _sOHM              Address of the sOHM token
    /// @param _gOHM              Address of the gOHM token
    /// @param _epochLength       Length of epoch in seconds
    /// @param _firstEpochNumber  First epoch number of the staking pool
    /// @param _firstEpochTime    Timestamp the first epoch will occur on
    /// @param _authority         Address of the Olympus Authority contract
    constructor(
        address _ohm,
        address _sOHM,
        address _gOHM,
        uint256 _epochLength,
        uint256 _firstEpochNumber,
        uint256 _firstEpochTime,
        address _authority
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        require(_ohm != address(0), "Zero address: OHM");
        OHM = IERC20(_ohm);
        require(_sOHM != address(0), "Zero address: sOHM");
        sOHM = IsOHM(_sOHM);
        require(_gOHM != address(0), "Zero address: gOHM");
        gOHM = IgOHM(_gOHM);

        epoch = Epoch({length: _epochLength, number: _firstEpochNumber, end: _firstEpochTime, distribute: 0});
    }

    /// MUTATIVE FUNCTIONS ///

    /// @notice           Stakes OHM to recieve back sOHM or gOHM
    /// @param _to        Address of whom will receieve the staked token
    /// @param _amount    Amount of OHM that will be staked
    /// @param _rebasing  Bool if recieving the rebasing token (sOHM) or non rebasing token (gOHM)
    /// @param _claim     Bool if `_to` will recieve staked token or has to claim
    /// @return           Amount of sOHM or gOHM received plus bounty if the rebase was triggered
    function stake(
        address _to,
        uint256 _amount,
        bool _rebasing,
        bool _claim
    ) external returns (uint256) {
        OHM.safeTransferFrom(msg.sender, address(this), _amount);
        _amount = _amount.add(rebase()); // add bounty if rebase occurred
        if (_claim && warmupPeriod == 0) {
            return _send(_to, _amount, _rebasing);
        } else {
            Claim memory info = warmupInfo[_to];
            if (!info.lock) {
                require(_to == msg.sender, "External deposits for account are locked");
            }

            warmupInfo[_to] = Claim({
                deposit: info.deposit.add(_amount),
                gons: info.gons.add(sOHM.gonsForBalance(_amount)),
                expiry: epoch.number.add(warmupPeriod),
                lock: info.lock
            });

            gonsInWarmup = gonsInWarmup.add(sOHM.gonsForBalance(_amount));

            return _amount;
        }
    }

    /// @notice           Claim either sOHM or gOHM for an address
    /// @param _to        Address of who is being claimed for
    /// @param _rebasing  Bool if claiming the rebasing token (sOHM) or non rebasing token (gOHM)
    /// @return           Amount in terms of OHM that has been claimed
    function claim(address _to, bool _rebasing) public returns (uint256) {
        Claim memory info = warmupInfo[_to];

        if (!info.lock) {
            require(_to == msg.sender, "External claims for account are locked");
        }

        if (epoch.number >= info.expiry && info.expiry != 0) {
            delete warmupInfo[_to];

            gonsInWarmup = gonsInWarmup.sub(info.gons);

            return _send(_to, sOHM.balanceForGons(info.gons), _rebasing);
        }
        return 0;
    }

    /// @notice  User forfeits their unclaimed stake, only gets back initally deposit
    /// @return  Amount of OHM the user deposited and recieved back
    function forfeit() external returns (uint256) {
        Claim memory info = warmupInfo[msg.sender];
        delete warmupInfo[msg.sender];

        gonsInWarmup = gonsInWarmup.sub(info.gons);

        OHM.safeTransfer(msg.sender, info.deposit);

        return info.deposit;
    }

    /// @notice  prevent new deposits or claims from ext. address (protection from malicious activity)
    function toggleLock() external {
        warmupInfo[msg.sender].lock = !warmupInfo[msg.sender].lock;
    }

    /// @notice           Redeems sOHM or gOHM for OHM
    /// @param _to        Address of whom will receieve OHM once unstaked
    /// @param _amount    Amount of sOHM or gOHM that will be unstaked
    /// @param _trigger   Bool if this action will call `rebase()`
    /// @param _rebasing  Bool if unstaking the rebasing token (sOHM) or non rebasing token (gOHM)
    /// @return amount_   Amount of OHM that `_to` received
    function unstake(
        address _to,
        uint256 _amount,
        bool _trigger,
        bool _rebasing
    ) external returns (uint256 amount_) {
        amount_ = _amount;
        uint256 bounty;
        if (_trigger) {
            bounty = rebase();
        }
        if (_rebasing) {
            sOHM.safeTransferFrom(msg.sender, address(this), _amount);
            amount_ = amount_.add(bounty);
        } else {
            gOHM.burn(msg.sender, _amount); // amount was given in gOHM terms
            amount_ = gOHM.balanceFrom(amount_).add(bounty); // convert amount to OHM terms & add bounty
        }

        require(amount_ <= OHM.balanceOf(address(this)), "Insufficient OHM balance in contract");
        OHM.safeTransfer(_to, amount_);
    }

    /// @notice            convert `_amount` sOHM into `gBalance_` gOHM
    /// @param _to         Address of whom will receieve gOHM once sOHM is wrapped
    /// @return gBalance_  Amount of gOHM that `_to` recieved 
    function wrap(address _to, uint256 _amount) external returns (uint256 gBalance_) {
        sOHM.safeTransferFrom(msg.sender, address(this), _amount);
        gBalance_ = gOHM.balanceTo(_amount);
        gOHM.mint(_to, gBalance_);
    }

    /// @notice            Convert `_amount` gOHM into `sBalance_` sOHM
    /// @param _to         Address of whom will receieve sOHM once gOHM is unwrapped
    /// @return sBalance_  Amount of sOHM that `_to` recieved 
    function unwrap(address _to, uint256 _amount) external returns (uint256 sBalance_) {
        gOHM.burn(msg.sender, _amount);
        sBalance_ = gOHM.balanceFrom(_amount);
        sOHM.safeTransfer(_to, sBalance_);
    }

    /// @notice  If end of epoch trigger rebase of sOHM. Returns bounty amount for triggering
    /// @return  Amount of OHM minted for triggering rebase 
    function rebase() public returns (uint256) {
        uint256 bounty;
        if (epoch.end <= block.timestamp) {
            sOHM.rebase(epoch.distribute, epoch.number);

            epoch.end = epoch.end.add(epoch.length);
            epoch.number++;

            if (address(distributor) != address(0)) {
                distributor.distribute();
                bounty = distributor.retrieveBounty(); // Will mint ohm for this contract if there exists a bounty
            }
            uint256 balance = OHM.balanceOf(address(this));
            uint256 staked = sOHM.circulatingSupply();
            if (balance <= staked.add(bounty)) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance.sub(staked).sub(bounty);
            }
        }
        return bounty;
    }

    /// INTERNAL FUNCTIONS ///

    /// @notice           Internal function that calculates how much sOHM or gOHM to send
    /// @param _to        Address of whom will be minted the sOHM or gOHM
    /// @param _amount    Amount of OHM to be sent
    /// @param _rebasing  Bool if sending rebasing token (sOHM) or non rebasing token (gOHM)
    /// @return           Amount of sOHM or gOHM that has been sent 
    function _send(
        address _to,
        uint256 _amount,
        bool _rebasing
    ) internal returns (uint256) {
        if (_rebasing) {
            sOHM.safeTransfer(_to, _amount); // send as sOHM (equal unit as OHM)
            return _amount;
        } else {
            gOHM.mint(_to, gOHM.balanceTo(_amount)); // send as gOHM (convert units from OHM)
            return gOHM.balanceTo(_amount);
        }
    }

    /// VIEW FUNCTIONS ///

    /// @notice  Returns the sOHM index, which tracks rebase growth
    /// @return  sOHM index
    function index() public view returns (uint256) {
        return sOHM.index();
    }

    /// @notice  Returns balance in OHM of the warmp
    /// @return  Balance in OHM of the warmup
    function supplyInWarmup() public view returns (uint256) {
        return sOHM.balanceForGons(gonsInWarmup);
    }

    /// @notice  Returns seconds left till the end of next epoch
    /// @return  Seconds left till end of next epoch
    function secondsToNextEpoch() external view returns (uint256) {
        return epoch.end.sub(block.timestamp);
    }

    /// MANAGERIAL FUNCTIONS ///

    /// @notice              Sets the address of the distributor
    /// @param _distributor  Address of the distirbutor that mints OHM every epoch     
    function setDistributor(address _distributor) external onlyGovernor {
        distributor = IDistributor(_distributor);
        emit DistributorSet(_distributor);
    }

    /// @notice               Sets the amount of time needed to be in warmup contract prior to claiming for new stakers
    /// @param _warmupPeriod  Amount of time needed to spend in warmup prior to claiming
    function setWarmupLength(uint256 _warmupPeriod) external onlyGovernor {
        warmupPeriod = _warmupPeriod;
        emit WarmupSet(_warmupPeriod);
    }
}
