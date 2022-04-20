interface ICurvePoolFactory {
    function get_coins(address _pool) external view returns (address[4] memory);

    function deploy_plain_pool(
        string memory _name,
        string memory _symbol,
        address[4] memory _coins,
        uint256 _A,
        uint256 _fee
    ) external returns (address);

    function pool_list(uint256 _arg) external view returns (address);

    function pool_count() external view returns (uint256);
}