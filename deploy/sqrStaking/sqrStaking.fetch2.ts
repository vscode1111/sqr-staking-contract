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

    // const userId = 'ca2-f75c73b1-0f13-46ae-88f8-2048765c5a007';
    const userId = 'total-reward-user-1';
    // const userId = 'f9a3e3dc-799b-46d1-81d7-888c839ea80a';
    // const userId = '087cee07-29b2-49c2-b85d-8adbbe812845';
    // const userId = deployData.userId1;

    const result = {
      userId,
      userBalanceOf: await ownerSQRStaking.balanceOf(userId),
    };

    console.table(result);
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:fetch2`];

export default func;
