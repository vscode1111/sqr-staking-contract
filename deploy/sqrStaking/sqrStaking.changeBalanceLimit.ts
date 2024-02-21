import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is withdrawing to user...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { owner2SQRStaking } = context;

    const params = {
      balanceLimit: deployData.balanceLimit,
    };

    console.table(params);
    await waitTx(owner2SQRStaking.changeBalanceLimit(params.balanceLimit), 'changeBalanceLimit');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:change-balance-limit`];

export default func;
