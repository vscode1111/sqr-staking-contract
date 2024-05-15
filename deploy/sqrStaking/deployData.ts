import { toUnixTime, toWei } from '~common';
import { DAYS, MINUTES } from '~constants';
import { ContractConfig, contractConfig, erc20Decimals, isTest, now } from '~seeds';
import { calculateAprForContract } from '../../utils';

export const verifyRequired = false;
export const verifyArgsRequired = true;

export const deployData = {
  companyReward: toWei(10_0000, erc20Decimals),
  // allowance: toWei(1_000_000, erc20Decimals),
  // stake1: toWei(123.12345678, erc20Decimals),
  allowance: toWei(10_0000, erc20Decimals),
  stake1: toWei(551.337, erc20Decimals),
  stake2: toWei(345.12345678, erc20Decimals),
  stake3: toWei(678.12345678, erc20Decimals),
  userStakeId1_0: 0,
  userStakeId2_0: 0,
  userStakeId3_0: 0,
};

// const mainContractConfig: Partial<ContractConfig> = {
//   //demo - contract 36500% / 1 day
//   duration: 1 * DAYS,
//   limit: ZERO,
//   minStakeAmount: ZERO,
//   maxStakeAmount: ZERO,
//   apr: calculateAprForContract(365 * 100),
//   depositDeadline: toUnixTime(now.add(30, 'days').toDate()),
//   // depositDeadline: 1710762760,
// };

const mainContractConfig: Partial<ContractConfig> = {
  //demo - contract 10% / 10 mins
  // duration: 720 * DAYS,
  duration: 3 * MINUTES,
  limit: toWei(1_000_000, erc20Decimals),
  minStakeAmount: toWei(0, erc20Decimals),
  maxStakeAmount: toWei(1_000_000, erc20Decimals),
  apr: calculateAprForContract(0),
  depositDeadline: toUnixTime(now.add(3650, 'days').toDate()),
  // depositDeadline: 1710762760,
};

// const mainContractConfig: Partial<ContractConfig> = {
//   //demo - contract 10% / 10 days
//   duration: 10 * DAYS,
//   limit: ZERO,
//   minStakeAmount: ZERO,
//   maxStakeAmount: ZERO,
//   apr: calculateAprForContract(10),
//   // depositDeadline: toUnixTime(now.add(30, 'days').toDate()),
//   depositDeadline: 1712936378,
// };

function prepareProdConfig(
  durationInDays: number,
  aprInPercents: number,
  limit: number,
): Partial<ContractConfig> {
  return {
    duration: durationInDays * DAYS,
    apr: calculateAprForContract(aprInPercents),
    // depositDeadline: toUnixTime(now.add(5 * 365, 'days').toDate()),
    depositDeadline: 1873465422, //5 years
    limit: toWei(limit, erc20Decimals),
    maxStakeAmount: toWei(limit, erc20Decimals),
  };
}

// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(10, 10, 20);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(10, 10, 365);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(30, 12.5, 60);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(60, 13.75, 120);

// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(90, 14, 1_000_000);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(180, 17.5, 750_000);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(360, 20, 500_000);

//15.05.2024
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(30, 0, 500_000);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(30, 10, 2_000_000);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(60, 12.5, 2_000_000);
// const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(360, 15, 2_000_000);
const prodContractConfig: Partial<ContractConfig> = prepareProdConfig(360, 0, 750_000);

const extContractConfig = isTest ? mainContractConfig : prodContractConfig;

export const deployContractConfig: ContractConfig = {
  ...contractConfig,
  ...extContractConfig,
};
