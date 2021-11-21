// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface IBondDepository {
    function addBond(
        IERC20 _principal,
        IOracle _oracle,
        uint256 _capacity, 
        bool _inPrincipal,
        uint256 _length,
        bool _fixedTerm,
        uint256 _vesting
    ) external returns (uint256 id_);

    function deposit(
        address _depositor,
        uint256 _bid,
        uint256 _amount,
        uint256 _maxPrice,
        address _feo
    ) external returns (uint256 payout_, uint256 index_);

    function maxPayout() external view returns (uint256);

    function payoutFor(uint256 _amount, uint256 _bid) external view returns (uint256);

    function bondPrice(uint256 _bid) external view returns (uint256);

    function bondPriceInUSD(uint256 _bid) external view returns (uint256);

    function debtRatio(uint256 _bid) external view returns (uint256);

    function currentDebt(uint256 _bid) external view returns (uint256);

    function debtDecay(uint256 _bid) external view returns (uint256 decay_);

    function bondTerms(uint256 _bid)
    external view returns (
        uint256 controlVariable_,
        uint256 conclusion_,
        bool fixedTerm_,
        uint256 vesting_,
        uint256 maxDebt_
    );

    function bondInfo(uint256 _bid)
    external
    view
    returns (
      address principal_,
      address oracle_,
      uint256 capacity_,
      bool capacityInPrincipal_,
      uint256 totalDebt_,
      uint256 last_
    );
}