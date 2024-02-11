import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is emergency withdrawing...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { owner2SQRStaking } = context;

    await waitTx(owner2SQRStaking.emergencyWithdrawn(), 'emergencyWithdrawn');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:emergency-withdrawn`];

export default func;
