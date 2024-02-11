import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { getAddressesFromHre, getSQRStakingContext, getUsers } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = await getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is fetching...`);
    const users = await getUsers();
    const { ownerSQRStaking } = await getSQRStakingContext(users, sqrStakingAddress);

    const result = {
      owner: await ownerSQRStaking.owner(),
    };

    console.table(result);
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:fetch`];

export default func;
