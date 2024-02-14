// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IPermitToken} from "./interfaces/IPermitToken.sol";

// import "hardhat/console.sol";

contract SQRStaking is OwnableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
  using ECDSA for bytes32;

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
    require(_balanceLimit > 0, "Balance limit can't be zero");

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
    bytes32 userID;
    bytes32 stakingID;
    uint256 amount;
    uint256 amountClaimed;
    uint256 stakedAt;
    uint256 claimedAt;
    uint256 stakingTypeID;
    bool withdrawn;
  }

  struct StakingType {
    uint256 duration;
    uint256 apy;
  }

  StakingType[] public stakingTypes;

  mapping(address user => uint256 stakesCount) private _stakesCount;
  mapping(bytes32 stakeID => address stakeOwner) private _stakesOwners;

  mapping(address user => StakingEntry[] stakes) public stakingData;
  mapping(bytes32 stakeID => StakingEntry stake) public stakes;

  address public coldWallet;
  uint256 public balanceLimit;

  IPermitToken public sqrToken;
  uint256 public stakedAmount;
  uint256 public paidAmount;

  uint256 internal _multiplierDivider;
  uint256 internal _apyDivider;
  uint256 internal _minStakeAmount;

  event Staked(bytes32 id, uint256 amount, address user);
  event Unstaked(bytes32 id, uint256 amount, address user);
  event APYClaim(bytes32 id, uint256 amount, address user);
  event APYRestake(bytes32 id, uint256 amount, address user);
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

  function stakeSig(
    uint256 stakingTypeID,
    string memory userID,
    string memory stakingID,
    uint256 amount,
    uint32 timestampLimit,
    bytes memory signature
  ) external nonReentrant {
    require(
      verifySignature(msg.sender, userID, stakingID, timestampLimit, signature),
      "Invalid signature"
    );
    _stake(amount, stakingTypeID, stakingID, userID, timestampLimit);
  }

  function claimSig(
    string memory stakingID,
    string memory userID,
    uint32 timestampLimit,
    bytes memory signature
  ) external nonReentrant {
    require(
      verifySignature(msg.sender, userID, stakingID, timestampLimit, signature),
      "Invalid signature"
    );
    _claim(stakingID);
  }

  function restakeSig(
    string memory stakingID,
    string memory userID,
    uint32 timestampLimit,
    bytes memory signature
  ) external nonReentrant {
    require(
      verifySignature(msg.sender, userID, stakingID, timestampLimit, signature),
      "Invalid signature"
    );
    _restake(stakingID);
  }

  function withdrawSig(
    string memory stakingID,
    string memory userID,
    uint32 timestampLimit,
    bytes memory signature
  ) external nonReentrant {
    require(
      verifySignature(msg.sender, userID, stakingID, timestampLimit, signature),
      "Invalid signature"
    );
    _unstake(stakingID);
  }

  function _stake(
    uint256 amount,
    uint256 stakingTypeID,
    string memory stakingID,
    string memory userID,
    uint32 timestampLimit
  ) private nonReentrant {
    address sender = _msgSender();
    bytes32 stackingIDHash = getHash(stakingID);

    require(block.timestamp <= timestampLimit, "Timeout blocker");
    require(stakes[stackingIDHash].stakedAt != 0, "Conflict");
    require(sqrToken.allowance(sender, address(this)) >= amount, "User must allow to use of funds");
    require(sqrToken.balanceOf(sender) >= amount, "User must have funds");
    require(stakingTypeID < stakingTypes.length, "Staking type isnt found");
    require(amount >= _minStakeAmount, "You cant stake that few tokens");

    stakingData[sender].push(
      StakingEntry(
        getHash(userID),
        stackingIDHash,
        amount,
        0,
        block.timestamp,
        block.timestamp,
        stakingTypeID,
        false
      )
    );
    _stakesCount[sender] += 1;
    _stakesOwners[stackingIDHash] = sender;
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

    emit Staked(stackingIDHash, amount, sender);
  }

  function _claim(string memory stakingID) private nonReentrant {
    address sender = _msgSender();
    bytes32 stackingIDHash = getHash(stakingID);

    require(_stakesOwners[stackingIDHash] == sender, "This stake doesnt belong to the sender");
    StakingEntry storage staking = stakes[stackingIDHash];

    require(!staking.withdrawn, "Already withdrawn");
    (, uint256 apy) = getStakingOptionInfo(staking.stakingTypeID);

    uint256 withdrawAmount = calculateAPY(staking.amount, apy, block.timestamp - staking.claimedAt);
    staking.amountClaimed += withdrawAmount;
    staking.claimedAt = block.timestamp;

    paidAmount += withdrawAmount;

    sqrToken.transfer(sender, withdrawAmount);

    emit APYClaim(staking.stakingID, withdrawAmount, sender);
  }

  function _restake(string memory stakingID) private nonReentrant {
    address sender = _msgSender();
    bytes32 stackingIDHash = getHash(stakingID);

    require(_stakesOwners[stackingIDHash] == sender, "This stake doesnt belong to the sender");
    StakingEntry storage staking = stakes[stackingIDHash];

    require(!staking.withdrawn, "Already withdrawn");
    (, uint256 apy) = getStakingOptionInfo(staking.stakingTypeID);

    uint256 restakeAmount = calculateAPY(staking.amount, apy, block.timestamp - staking.claimedAt);
    staking.claimedAt = block.timestamp;
    staking.amount += restakeAmount;

    paidAmount += restakeAmount;

    emit APYRestake(staking.stakingID, restakeAmount, sender);
  }

  function _unstake(string memory stakingID) private nonReentrant {
    address sender = _msgSender();
    bytes32 stackingIDHash = getHash(stakingID);

    require(_stakesOwners[stackingIDHash] == sender, "This stake doesnt belong to the sender");
    StakingEntry storage staking = stakes[stackingIDHash];

    require(!staking.withdrawn, "Already withdrawn");
    (uint256 duration, uint256 apy) = getStakingOptionInfo(staking.stakingTypeID);
    require(block.timestamp > staking.stakedAt + duration, "Too early to withdraw");

    staking.withdrawn = true;
    uint256 withdrawAmount = staking.amount +
      calculateAPY(staking.amount, apy, block.timestamp - staking.stakedAt) -
      staking.amountClaimed;

    paidAmount += withdrawAmount;
    stakedAmount -= staking.amount;

    sqrToken.transfer(sender, withdrawAmount);

    emit Unstaked(staking.stakingID, withdrawAmount, sender);
  }

  function verifySignature(
    address from,
    string memory userID,
    string memory stakingID,
    uint32 timestampLimit,
    bytes memory signature
  ) private view returns (bool) {
    bytes32 messageHash = keccak256(
      abi.encodePacked(from, address(this), userID, stakingID, timestampLimit)
    );
    address recover = messageHash.toEthSignedMessageHash().recover(signature);
    return recover == owner();
  }

  function getStakesCount(address user) public view returns (uint256) {
    return _stakesCount[user];
  }

  function getStakeOwner(string memory id) public view returns (address) {
    return _stakesOwners[getHash(id)];
  }

  function getBalance() public view returns (uint256) {
    return sqrToken.balanceOf(address(this));
  }

  function getHash(string memory value) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(value));
  }

  function emergencyWithdrawn() external onlyOwner {
    sqrToken.transfer(msg.sender, sqrToken.balanceOf(address(this)));
  }

  function emergencyWithdrawnValue() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }
}
