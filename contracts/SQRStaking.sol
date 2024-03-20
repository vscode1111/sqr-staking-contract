// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "hardhat/console.sol";

contract SQRStaking is Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  using Counters for Counters.Counter;

  //Variables, structs, modifiers, events------------------------

  Counters.Counter private _stakeCounter;
  Counters.Counter private _stakerCounter;

  string public constant VERSION = "1.0";
  uint32 public constant YEAR_PERIOD = 365 days;
  uint32 public constant APR_DIVIDER = 1000;

  IERC20 public erc20Token;
  uint32 public duration;
  uint32 public apr;
  uint32 public depositDeadline;
  uint256 public limit;
  uint256 public minStakeAmount;
  uint256 public maxStakeAmount;

  constructor(
    address _newOwner,
    address _erc20Token,
    uint32 _duration,
    uint32 _apr,
    uint32 _depositDeadline,
    uint256 _limit,
    uint256 _minStakeAmount,
    uint256 _maxStakeAmount
  ) {
    require(_newOwner != address(0), "New owner address can't be zero");
    require(_erc20Token != address(0), "ERC20 token address can't be zero");
    require(_duration > 0, "Duration must be greater than zero");
    require(_apr > 0, "APR must be greater than zero");
    require(
      _depositDeadline > uint32(block.timestamp),
      "depositDeadline must be greater than current time"
    );

    _transferOwnership(_newOwner);

    erc20Token = IERC20(_erc20Token);

    duration = _duration;
    apr = _apr;
    depositDeadline = _depositDeadline;
    limit = _limit;
    minStakeAmount = _minStakeAmount;
    maxStakeAmount = _maxStakeAmount;
  }

  struct StakeEntry {
    uint256 stakedAmount;
    uint256 claimedAmount;
    uint32 stakedAt;
    uint32 claimedAt;
    bool withdrawn;
  }

  mapping(address => StakeEntry[]) private stakeData;

  uint256 public totalStaked;
  uint256 public totalClaimed;
  uint256 public totalWithdrawn;
  uint256 public totalReservedReward;

  event Stake(address indexed user, uint32 userStakeId, uint256 amount);
  event Claim(address indexed user, uint32 userStakeId, uint256 amount);
  event Unstake(address indexed user, uint32 userStakeId, uint256 amount);
  event WithdrawExcessReward(address indexed to, uint256 amount);

  //Read methods-------------------------------------------

  function isStakeReady() public view returns (bool) {
    return uint32(block.timestamp) <= depositDeadline;
  }

  function getBalance() public view returns (uint256) {
    return erc20Token.balanceOf(address(this));
  }

  function getStakeCount() public view returns (uint32) {
    return uint32(_stakeCounter.current());
  }

  function getStakerCount() public view returns (uint32) {
    return uint32(_stakerCounter.current());
  }

  function getStakeCountForUser(address user) public view returns (uint256) {
    return stakeData[user].length;
  }

  function fetchStakesForUser(address user) external view returns (StakeEntry[] memory) {
    return stakeData[user];
  }

  function calculateReward(
    uint256 _amount,
    uint256 _apr,
    uint32 _duration
  ) public pure returns (uint256) {
    return (((_amount * _apr)) * _duration) / APR_DIVIDER / YEAR_PERIOD;
  }

  function calculateMaxRewardForStake(
    StakeEntry memory stakeEntry
  ) internal view returns (uint256) {
    return calculateReward(stakeEntry.stakedAmount, apr, duration);
  }

  function calculateCurrentRewardForStake(
    StakeEntry memory stakeEntry
  ) internal view returns (uint256) {
    uint256 maxReward = calculateMaxRewardForStake(stakeEntry);
    uint256 remainsReward = maxReward - stakeEntry.claimedAmount;

    uint256 calculatedReward = calculateReward(
      stakeEntry.stakedAmount,
      apr,
      uint32(block.timestamp) - stakeEntry.claimedAt
    );

    if (calculatedReward > remainsReward) {
      return remainsReward;
    }

    return calculatedReward;
  }

  function calculateMaxRewardForUser(
    address user,
    uint32 userStakeId
  ) public view returns (uint256) {
    if (userStakeId < getStakeCountForUser(user)) {
      return calculateMaxRewardForStake(stakeData[user][userStakeId]);
    }
    return 0;
  }

  function calculateCurrentRewardForUser(
    address user,
    uint32 userStakeId
  ) public view returns (uint256) {
    if (userStakeId < getStakeCountForUser(user)) {
      return calculateCurrentRewardForStake(stakeData[user][userStakeId]);
    }
    return 0;
  }

  function calculateExcessReward() public view returns (uint256) {
    uint256 contractBalance = getBalance();
    uint256 totalStakedAndReward = totalStaked + totalReservedReward;
    if (contractBalance > totalStakedAndReward) {
      return contractBalance - totalStakedAndReward;
    }
    return 0;
  }

  function calculateRequiredReward() public view returns (uint256) {
    uint256 contractBalance = getBalance();
    uint256 totalStakedAndReward = totalStaked + totalReservedReward;
    if (totalStakedAndReward > contractBalance) {
      return totalStakedAndReward - contractBalance;
    }
    return 0;
  }

  //Write methods-------------------------------------------

  function stake(uint256 amount) external nonReentrant {
    require(amount > 0, "Amount must be greater than zero");
    require(uint32(block.timestamp) <= depositDeadline, "Deposit deadline is over");
    require(limit == 0 || totalStaked + amount <= limit, "Stake limit is over");

    address sender = _msgSender();

    require(
      erc20Token.allowance(sender, address(this)) >= amount,
      "User must allow to use of funds"
    );
    require(erc20Token.balanceOf(sender) >= amount, "User must have funds");
    require(amount >= minStakeAmount, "You can't stake less than minimum amount");
    require(
      maxStakeAmount == 0 || amount <= maxStakeAmount,
      "You can't stake more than maximum amount"
    );

    StakeEntry[] storage stakeEntries = stakeData[sender];

    if (stakeEntries.length == 0) {
      _stakerCounter.increment();
    }

    StakeEntry memory stakeEntry = StakeEntry(
      amount,
      0,
      uint32(block.timestamp),
      uint32(block.timestamp),
      false
    );

    stakeEntries.push(stakeEntry);
    totalStaked += amount;
    totalReservedReward += calculateReward(amount, apr, duration);

    _stakeCounter.increment();

    erc20Token.safeTransferFrom(sender, address(this), amount);

    emit Stake(sender, uint32(stakeEntries.length) - 1, amount);
  }

  function claim(uint32 userStakeId) external nonReentrant {
    address sender = _msgSender();

    require(userStakeId < getStakeCountForUser(sender), "Stake data isn't found");
    StakeEntry storage stakeEntry = stakeData[sender][userStakeId];

    require(!stakeEntry.withdrawn, "Already withdrawn");

    uint256 currentReward = calculateCurrentRewardForStake(stakeEntry);
    require(currentReward > 0, "You have no reward");

    uint256 contractBalance = getBalance();
    require(contractBalance >= totalStaked + currentReward, "Contract has no tokens for claiming");

    stakeEntry.claimedAmount += currentReward;
    stakeEntry.claimedAt = uint32(block.timestamp);

    totalWithdrawn += currentReward;
    totalClaimed += currentReward;
    totalReservedReward -= currentReward;

    erc20Token.safeTransfer(sender, currentReward);

    emit Claim(sender, userStakeId, currentReward);
  }

  function unstake(uint32 userStakeId) external nonReentrant {
    address sender = _msgSender();

    require(userStakeId < getStakeCountForUser(sender), "Stake data isn't found");
    StakeEntry storage stakeEntry = stakeData[sender][userStakeId];

    require(!stakeEntry.withdrawn, "Already withdrawn");
    require(uint32(block.timestamp) > stakeEntry.stakedAt + duration, "Too early to withdraw");

    stakeEntry.withdrawn = true;

    uint256 currentReward = calculateCurrentRewardForStake(stakeEntry);

    uint256 contractBalance = getBalance();

    require(contractBalance >= totalStaked + currentReward, "Contract has no tokens for unstake");

    uint256 unstakeAmount = stakeEntry.stakedAmount + currentReward;

    totalStaked -= stakeEntry.stakedAmount;
    totalClaimed += currentReward;
    totalWithdrawn += unstakeAmount;
    totalReservedReward -= currentReward;

    erc20Token.safeTransfer(sender, unstakeAmount);

    emit Unstake(sender, userStakeId, unstakeAmount);
  }

  function withdrawExcessReward() external nonReentrant onlyOwner {
    uint256 amount = calculateExcessReward();
    address to = owner();
    erc20Token.safeTransfer(to, amount);
    emit WithdrawExcessReward(to, amount);
  }
}
