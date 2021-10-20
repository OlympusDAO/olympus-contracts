// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";

interface IOldTreasury {
  function withdraw(uint256 _amount, address _token) external;

  function mint(address _recipient, uint256 _amount) external;

  function manage(address _token, uint256 _amount) external;

  function excessReserves() external view returns (uint256);
}

interface INewTreasury {
  function deposit(
    uint256 _amount,
    address _token,
    uint256 _profit
  ) external returns (uint256 send_);

  function tokenValue(address _token, uint256 _amount) external view returns (uint256 value_);
}

contract TreasuryTokenMigrator {
  struct Token {
    address token;
    bool reserveToken;
  }

  address public immutable DAO;
  address public immutable DAI;
  address public immutable oldTreasury;
  address public immutable newTreasury;

  Token[] public tokens;

  constructor(
    address _DAO,
    address _DAI,
    address _oldTreasury,
    address _newTreasury
  ) {
    require(_DAO != address(0));
    DAO = _DAO;

    require(_DAI != address(0));
    DAI = _DAI;

    require(_oldTreasury != address(0));
    oldTreasury = _oldTreasury;

    require(_newTreasury != address(0));
    newTreasury = _newTreasury;
  }

  /**
   *   @notice Migrate OHM/DAI SLP and tokens to new treasury
   */
  function migrate() external {
    require(msg.sender == DAO);
    _migrateTokens();
  }

  /**
   *   @notice adds tokens to tokens array
   *   @param _tokens address[]
   *   @param _reserveToken bool[]
   */
  function addTokens(address[] memory _tokens, bool[] memory _reserveToken) external {
    require(msg.sender == DAO);
    require(_tokens.length == _reserveToken.length);

    for (uint256 i = 0; i < _tokens.length; i++) {
      tokens.push(Token({token: _tokens[i], reserveToken: _reserveToken[i]}));
    }
  }

  /**
   *   @notice Migrates tokens from old treasury to new treasury
   */
  function _migrateTokens() internal {
    for (uint256 i = 0; i < tokens.length; i++) {
      Token memory _token = tokens[i];

      uint256 balance = IERC20(_token.token).balanceOf(oldTreasury);

      uint256 excessReserves = IOldTreasury(oldTreasury).excessReserves();
      uint256 tokenValue = INewTreasury(newTreasury).tokenValue(_token.token, balance);

      if (tokenValue > excessReserves) {
        tokenValue = excessReserves;
        balance = excessReserves * 10**9;
      }

      IOldTreasury(oldTreasury).manage(_token.token, balance);

      if (_token.reserveToken) {
        IERC20(_token.token).approve(newTreasury, balance);
        INewTreasury(newTreasury).deposit(balance, _token.token, tokenValue);
      } else {
        IERC20(_token.token).transfer(newTreasury, balance);
      }
    }
  }
}
