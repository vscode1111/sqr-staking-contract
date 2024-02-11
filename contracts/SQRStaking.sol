// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IPermitToken.sol";

import "hardhat/console.sol";

contract SQRStaking is OwnableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(address _newOwner, address _sqrToken) public initializer {
    require(_newOwner != address(0), "New owner address can't be zero");
    require(_sqrToken != address(0), "SQR token address can't be zero");

    __Ownable_init();
    __UUPSUpgradeable_init();

    _transferOwnership(_newOwner);
    stakingTypes.push(StakingType(91 days, 20, 10));
    stakingTypes.push(StakingType(182 days, 30, 15));
    stakingTypes.push(StakingType(365 days, 40, 20));
    stakingTypes.push(StakingType(730 days, 60, 30));

    sqrToken = IERC20(_sqrToken);
    _multiplierDivider = 10;
    _apyDivider = 1000;
    _minStakAmount = 1e5; //0.001 SQR
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  //Variables, structs, modifiers, events------------------------

  struct StakEntry {
    uint256 amount;
    uint256 stakedAt;
    uint256 stakingTypeID;
    bool withdrawn;
  }

  struct StakingType {
    uint256 duration;
    uint256 apy;
    uint256 bonusMultiplier;
  }

  StakingType[] public stakingTypes;

  mapping(address => uint256) private _stakesCount;
  mapping(uint256 => address) private _stakOwners;

  mapping(address => StakEntry[]) public stakingData;

  IERC20 public sqrToken;
  uint256 public stakedAmount;
  uint256 public paidAmount;

  uint256 public stakingID;

  uint256 internal _multiplierDivider;
  uint256 internal _apyDivider;
  uint256 internal _minStakAmount;

  event Staked(uint256 id, uint256 amount, uint256 gAmount, address user);
  event Unstaked(uint256 id, uint256 amount, address user);

  //Functions-------------------------------------------

  function getStakingOptionInfo(uint256 id) public view returns (uint256, uint256, uint256) {
    StakingType memory stakingType = stakingTypes[id];
    return (stakingType.duration, stakingType.apy, stakingType.bonusMultiplier);
  }

  function calculateAPY(
    uint256 amount,
    uint256 apy,
    uint256 duration
  ) public view returns (uint256) {
    return (((amount * apy)) * duration) / _apyDivider / 365 days;
  }

  function setMinStakeAmount(uint256 amnt) external onlyOwner {
    _minStakAmount = amnt;
  }

  function stake(uint256 amount, uint256 StakingTypeID) external {
    // console.log(111, amount, _minStakAmount);
    address sender = _msgSender();

    require(sqrToken.allowance(sender, address(this)) >= amount, "User must allow to use of funds");
    require(sqrToken.balanceOf(sender) >= amount, "User must have funds");
    require(StakingTypeID < stakingTypes.length, "Staking type isnt found");
    require(amount >= _minStakAmount, "You cant stake that few tokens");
    (uint256 duration, , uint256 bonusMultiplier) = getStakingOptionInfo(StakingTypeID);
    uint256 gAmount = ((((amount * duration) / 1 days)) * bonusMultiplier) /
      _multiplierDivider /
      1 ether;
    sqrToken.transferFrom(sender, address(this), amount);

    stakingID++;

    stakingData[sender].push(StakEntry(amount, block.timestamp, StakingTypeID, false));
    _stakesCount[sender] += 1;
    _stakOwners[stakingID] = sender;
    stakedAmount += amount;

    emit Staked(stakingID, amount, gAmount, sender);
  }

  function unstake(uint256 id) external {
    address sender = _msgSender();

    require(id < getStakesCount(sender), "Staking data isnt found");
    StakEntry storage staking = stakingData[sender][id];

    (uint256 duration, uint256 apy, ) = getStakingOptionInfo(staking.stakingTypeID);

    require(!staking.withdrawn, "Already withdrawn");
    require(block.timestamp > staking.stakedAt + duration, "Too early to withdraw");

    staking.withdrawn = true;
    uint256 withdrawAmount = staking.amount + calculateAPY(staking.amount, apy, duration);

    sqrToken.transfer(sender, withdrawAmount);
    paidAmount += withdrawAmount;
    stakedAmount -= staking.amount;

    emit Unstaked(stakingID, withdrawAmount, sender);
  }

  function getStakesCount(address user) public view returns (uint256) {
    return _stakesCount[user];
  }

  function getStakeOwner(uint256 ID) public view returns (address) {
    return _stakOwners[ID];
  }

  function emergencyWithdrawn() external onlyOwner {
    sqrToken.transfer(msg.sender, sqrToken.balanceOf(address(this)));
  }

  function emergencyWithdrawnValue() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }
}
