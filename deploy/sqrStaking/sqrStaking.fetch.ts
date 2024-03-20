import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { erc20Decimals, seedData } from '~seeds';
import {
  calculateAprFromContract,
  calculateDaysFromContract,
  getAddressesFromHre,
  getSQRStakingContext,
  getUsers,
} from '~utils';

function printToken(value: bigint) {
  return `${toNumberDecimals(value, erc20Decimals)} SQR`;
}

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = await getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is fetching...`);
    const users = await getUsers();
    const { user1Address } = users;
    const { owner2SQRStaking } = await getSQRStakingContext(users, sqrStakingAddress);

    const result = {
      VERSION: await owner2SQRStaking.VERSION(),
      owner: await owner2SQRStaking.owner(),
      apr: `${calculateAprFromContract(await owner2SQRStaking.apr())}%`,
      duration: `${calculateDaysFromContract(await owner2SQRStaking.duration()).toFixed(2)} days`,
      limit: printToken(await owner2SQRStaking.limit()),
      minStakeAmount: printToken(await owner2SQRStaking.minStakeAmount()),
      maxStakeAmount: printToken(await owner2SQRStaking.maxStakeAmount()),
      isStakeReady: await owner2SQRStaking.isStakeReady(),
      getBalance: printToken(await owner2SQRStaking.getBalance()),
      getStakeCount: Number(await owner2SQRStaking.getStakeCount()),
      getStakerCount: Number(await owner2SQRStaking.getStakerCount()),
      getStakeCountForUser1: Number(await owner2SQRStaking.getStakeCountForUser(user1Address)),
      calculateMaxRewardForUser1: printToken(
        await owner2SQRStaking.calculateMaxRewardForUser(user1Address, seedData.userStakeId1_0),
      ),
      calculateCurrentRewardForUser1: printToken(
        await owner2SQRStaking.calculateCurrentRewardForUser(user1Address, seedData.userStakeId1_0),
      ),
      calculateRequiredReward: printToken(await owner2SQRStaking.calculateRequiredReward()),
      calculateExcessReward: printToken(await owner2SQRStaking.calculateExcessReward()),
    };

    console.table(result);
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:fetch`];

export default func;
