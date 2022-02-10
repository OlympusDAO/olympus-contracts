// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IERC20.sol";

interface IDistributorRebase {
    function triggerRebase() external;
}

interface Keep3r {
    function isKeeper(address) external view returns (bool);

    function worked(address) external;
}

contract Keep3rJob {
    IDistributorRebase public constant stakingDistributor =
        IDistributorRebase(0x623164A9Ee2556D524b08f34F1d2389d7B4e1A1C);
    Keep3r public constant KPR = Keep3r(0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44);
    address public constant DAO = 0x245cc372C84B3645Bf0Ffe6538620B04a217988B;

    /// @notice Provides an interface for keepers to execute rebases
    /// @dev requires that the caller is a valid keeper. Automatically extracts payment at the end
    /// @dev On a successful trigger the contract will contain ohm
    function triggerRebase() external {
        require(KPR.isKeeper(msg.sender), "Keep3rJob::triggerRebase: not a valid keeper");
        stakingDistributor.triggerRebase();
        KPR.worked(msg.sender);
    }

    function withdrawFunds(address token) external {
        require(msg.sender == DAO, "Not DAO MS");
        uint256 tokenBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, tokenBalance);
    }
}
