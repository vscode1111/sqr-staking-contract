import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { getContractArgsEx } from './utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress: sqrTokenAddress } = await getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrTokenAddress} is verify...`);
    await verifyContract(sqrTokenAddress, hre, getContractArgsEx());
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:verify`];

export default func;
