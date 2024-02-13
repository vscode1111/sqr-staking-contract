// SPDX-License-identifier: MIT
pragma solidity ^0.8.18;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {IPermitToken} from "./interfaces/IPermitToken.sol";

// import "hardhat/console.sol";

contract SQRStaking is OwnableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address _newOwner,
    address _sqrToken,
    address _coldWallet,
    uint256 _balanceLimit
  ) public initializer {
    require(_newOwner != address(0), "New owner address can't be zero");
    require(_sqrToken != address(0), "SQR token address can't be zero");

    __Ownable_init();
    __UUPSUpgradeable_init();

    _transferOwnership(_newOwner);
    stakingTypes.push(StakingType(30 days, 100));
    stakingTypes.push(StakingType(90 days, 125));
    stakingTypes.push(StakingType(180 days, 150));
    stakingTypes.push(StakingType(360 days, 200));
    stakingTypes.push(StakingType(720 days, 300));
    stakingTypes.push(StakingType(10 minutes, 1000));

    sqrToken = IPermitToken(_sqrToken);
    _apyDivider = 1000;
    _minStakeAmount = 1e5; //0.001 SQR
    coldWallet = _coldWallet;
    balanceLimit = _balanceLimit;
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  //Variables, structs, modifiers, events------------------------

  struct StakingEntry {
    uint256 amount;
    uint256 stakedAt;
    uint256 stakingTypeId;
    bool withdrawn;
  }

  struct StakingType {
    uint256 duration;
    uint256 apy;
  }

  StakingType[] public stakingTypes;

  mapping(address user => uint256 stakesCount) private _stakesCount;
  mapping(uint256 user => address stakeOwner) private _stakesOwners;

  mapping(address user => StakingEntry[] stakes) public stakingData;

  address public coldWallet;
  uint256 public balanceLimit;

  IPermitToken public sqrToken;
  uint256 public stakedAmount;
  uint256 public paidAmount;

  uint256 public stakingid;

  uint256 internal _multiplierDivider;
  uint256 internal _apyDivider;
  uint256 internal _minStakeAmount;

  event Staked(uint256 id, uint256 amount, address user);
  event Unstaked(uint256 id, uint256 amount, address user);
  event ChangeBalanceLimit(address indexed sender, uint256 balanceLimit);

  //Functions-------------------------------------------

  function changeBalanceLimit(uint256 _balanceLimit) external onlyOwner {
    balanceLimit = _balanceLimit;
    emit ChangeBalanceLimit(_msgSender(), _balanceLimit);
  }

  function getStakingOptionInfo(uint256 id) public view returns (uint256, uint256) {
    StakingType memory stakingType = stakingTypes[id];
    return (stakingType.duration, stakingType.apy);
  }

  function calculateAPY(
    uint256 amount,
    uint256 apy,
    uint256 duration
  ) public view returns (uint256) {
    return (((amount * apy)) * duration) / _apyDivider / 365 days;
  }

  function setMinStakeAmount(uint256 amnt) external onlyOwner {
    _minStakeAmount = amnt;
  }

  function stake(uint256 amount, uint256 stakingTypeid) external nonReentrant {
    address sender = _msgSender();

    require(sqrToken.allowance(sender, address(this)) >= amount, "User must allow to use of funds");
    require(sqrToken.balanceOf(sender) >= amount, "User must have funds");
    require(stakingTypeid < stakingTypes.length, "Staking type isnt found");
    require(amount >= _minStakeAmount, "You cant stake that few tokens");

    stakingid++;

    stakingData[sender].push(StakingEntry(amount, block.timestamp, stakingTypeid, false));
    _stakesCount[sender] += 1;
    _stakesOwners[stakingid] = sender;
    stakedAmount += amount;

    uint256 contractBalance = getBalance();
    uint256 supposedBalance = contractBalance + amount;

    if (supposedBalance > balanceLimit) {
      uint256 userToContractAmount = 0;
      uint256 userToColdWalletAmount = supposedBalance - balanceLimit;
      uint256 contractToColdWalletAmount = 0;

      if (amount > userToColdWalletAmount) {
        userToContractAmount = amount - userToColdWalletAmount;
      } else {
        userToColdWalletAmount = amount;
        contractToColdWalletAmount = contractBalance - balanceLimit;
      }

      if (userToContractAmount > 0) {
        sqrToken.transferFrom(sender, address(this), userToContractAmount);
      }
      if (userToColdWalletAmount > 0) {
        sqrToken.transferFrom(sender, coldWallet, userToColdWalletAmount);
      }
      if (contractToColdWalletAmount > 0) {
        sqrToken.transfer(coldWallet, contractToColdWalletAmount);
      }
    } else {
      sqrToken.transferFrom(sender, address(this), amount);
    }

    emit Staked(stakingid, amount, sender);
  }

  function unstake(uint256 id) external nonReentrant {
    address sender = _msgSender();

    require(id < getStakesCount(sender), "Staking data isnt found");
    StakingEntry storage staking = stakingData[sender][id];

    (uint256 duration, uint256 apy) = getStakingOptionInfo(staking.stakingTypeId);

    require(!staking.withdrawn, "Already withdrawn");
    require(block.timestamp > staking.stakedAt + duration, "Too early to withdraw");

    staking.withdrawn = true;
    uint256 withdrawAmount = staking.amount + calculateAPY(staking.amount, apy, duration);

    paidAmount += withdrawAmount;
    stakedAmount -= staking.amount;

    sqrToken.transfer(sender, withdrawAmount);

    emit Unstaked(stakingid, withdrawAmount, sender);
  }

  function getStakesCount(address user) public view returns (uint256) {
    return _stakesCount[user];
  }

  function getStakeOwner(uint256 id) public view returns (address) {
    return _stakesOwners[id];
  }

  function getBalance() public view returns (uint256) {
    return sqrToken.balanceOf(address(this));
  }

  function emergencyWithdrawn() external onlyOwner {
    sqrToken.transfer(msg.sender, sqrToken.balanceOf(address(this)));
  }

  function emergencyWithdrawnValue() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }
}
