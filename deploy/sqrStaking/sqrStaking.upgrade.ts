import { upgrades } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { getAddressesFromHre, getSQRStakingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is upgrading...`);
    const { owner2SqrLockupFactory } = await getSQRStakingContext(
      await getUsers(),
      sqrStakingAddress,
    );
    await upgrades.upgradeProxy(sqrStakingAddress, owner2SqrLockupFactory);
    console.log(`${SQR_STAKING_NAME} upgraded to ${sqrStakingAddress}`);
    if (verifyRequired) {
      await verifyContract(sqrStakingAddress, hre);
      console.log(`${SQR_STAKING_NAME} upgraded and verified to ${sqrStakingAddress}`);
    }
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:upgrade`];

export default func;
