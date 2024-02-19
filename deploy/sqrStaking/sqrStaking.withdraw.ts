import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is withdrawing to user...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { user3Address, owner2SQRStaking, user1SQRToken } = context;

    const decimals = Number(await user1SQRToken.decimals());

    const amount = await owner2SQRStaking.getBalance();
    console.log(`${toNumberDecimals(amount, decimals)} SQR in contract`);

    const params = {
      token: sqrTokenAddress,
      to: user3Address,
      amount,
    };

    console.table(params);
    await waitTx(
      owner2SQRStaking.emergencyWithdraw(params.token, params.to, params.amount),
      'emergencyWithdraw',
    );
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:emergency-withdraw`];

export default func;
