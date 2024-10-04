import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toNumberDecimals } from '~common';
import { callWithTimerHre } from '~common-contract';
import { WEB3_STAKING_NAME } from '~constants';
import { erc20Decimals, seedData } from '~seeds';
import {
  calculateAprFromContract,
  calculateDaysFromContract,
  getAddressesFromHre,
  getWEB3StakingContext,
  getUsers,
} from '~utils';

function printToken(value: bigint) {
  return `${toNumberDecimals(value, erc20Decimals)} WEB3`;
}

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3StakingAddress } = await getAddressesFromHre(hre);
    console.log(`${WEB3_STAKING_NAME} ${web3StakingAddress} is fetching...`);
    const users = await getUsers();
    const { user1Address } = users;
    const { owner2WEB3Staking } = await getWEB3StakingContext(users, web3StakingAddress);

    const result = {
      VERSION: await owner2WEB3Staking.VERSION(),
      owner: await owner2WEB3Staking.owner(),
      apr: `${calculateAprFromContract(await owner2WEB3Staking.apr())}%`,
      duration: `${calculateDaysFromContract(await owner2WEB3Staking.duration()).toFixed(2)} days`,
      limit: printToken(await owner2WEB3Staking.limit()),
      minStakeAmount: printToken(await owner2WEB3Staking.minStakeAmount()),
      maxStakeAmount: printToken(await owner2WEB3Staking.maxStakeAmount()),
      accountLimit: printToken(await owner2WEB3Staking.accountLimit()),
      isStakeReady: await owner2WEB3Staking.isStakeReady(),
      getBalance: printToken(await owner2WEB3Staking.getBalance()),
      getStakeCount: Number(await owner2WEB3Staking.getStakeCount()),
      getStakerCount: Number(await owner2WEB3Staking.getStakerCount()),
      getStakeCountForUser1: Number(await owner2WEB3Staking.getStakeCountForUser(user1Address)),
      calculateMaxRewardForUser1: printToken(
        await owner2WEB3Staking.calculateMaxRewardForUser(user1Address, seedData.userStakeId1_0),
      ),
      calculateCurrentRewardForUser1: printToken(
        await owner2WEB3Staking.calculateCurrentRewardForUser(user1Address, seedData.userStakeId1_0),
      ),
      calculateRequiredReward: printToken(await owner2WEB3Staking.calculateRequiredReward()),
      calculateExcessReward: printToken(await owner2WEB3Staking.calculateExcessReward()),
    };

    console.table(result);
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:fetch`];

export default func;
