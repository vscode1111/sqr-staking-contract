// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract SQRToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, ReentrancyGuard {
  uint8 _decimals;

  constructor(
    string memory name_,
    string memory symbol_,
    address newOwner,
    uint256 initMint,
    uint8 decimals_
  ) ERC20(name_, symbol_) ERC20Permit(name_) {
    _transferOwnership(newOwner);
    _mint(newOwner, initMint);
    _decimals = decimals_;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }
}
