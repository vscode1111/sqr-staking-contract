import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, sleep, verifyContract } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getSQRStakingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';
import { getContractArgsEx } from './utils';

const pauseTime = 10;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${SQR_STAKING_NAME} is deploying...`);
    console.table(contractConfig);
    console.log(`Pause ${pauseTime} sec to make sure...`);
    await sleep(pauseTime * 1000);

    console.log(`Deploying...`);
    const { sqrStakingAddress } = await getSQRStakingContext(await getUsers(), {
      newOwner: contractConfig.newOwner,
      sqrToken: contractConfig.sqrToken,
      coldWallet: contractConfig.coldWallet,
      balanceLimit: contractConfig.balanceLimit,
    });
    console.log(`${SQR_STAKING_NAME} deployed to ${sqrStakingAddress}`);
    if (verifyRequired) {
      await verifyContract(sqrStakingAddress, hre, getContractArgsEx());
      console.log(`${SQR_STAKING_NAME} deployed and verified to ${sqrStakingAddress}`);
    }
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:deploy`];

export default func;
