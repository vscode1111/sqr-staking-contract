import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployData } from './deployData';

const USER_ID = '9049f3e5-8974-4730-b5a6-969998d783d7';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is withdrawing to user...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { owner2SQRStaking, user1SQRToken } = context;

    const decimals = Number(await user1SQRToken.decimals());

    const amount = await owner2SQRStaking.balanceOf(USER_ID);
    console.log(`${toNumberDecimals(amount, decimals)} SQR in contract for ${USER_ID}`);

    const params = {
      balanceLimit: deployData.balanceLimit,
    };

    console.table(params);
    await waitTx(owner2SQRStaking.changeBalanceLimit(params.balanceLimit), 'changeBalanceLimit');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:change-balance-limit`];

export default func;
