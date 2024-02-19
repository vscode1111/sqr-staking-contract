import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig, seedData } from '~seeds';
import { getAddressesFromHre, getContext, signMessageForDeposit } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is depositing...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { owner2, user1Address, user1SQRToken, user1SQRStaking } = context;

    const decimals = Number(await user1SQRToken.decimals());

    const currentAllowance = await user1SQRToken.allowance(user1Address, sqrStakingAddress);
    console.log(`${toNumberDecimals(currentAllowance, decimals)} SQR was allowed`);

    const params = {
      userId: deployData.userId1,
      transationId: seedData.depositTransationId1,
      amount: seedData.deposit1,
      timestamptLimit: seedData.nowPlus1m,
      signature: '',
    };

    params.signature = await signMessageForDeposit(
      owner2,
      params.userId,
      params.transationId,
      params.amount,
      params.timestamptLimit,
    );

    if (params.amount > currentAllowance) {
      const askAllowance = seedData.allowance;
      await waitTx(user1SQRToken.approve(sqrStakingAddress, askAllowance), 'approve');
      console.log(
        `${toNumberDecimals(askAllowance, decimals)} SQR was approved to ${sqrStakingAddress}`,
      );
    }

    console.table(params);

    await waitTx(
      user1SQRStaking.depositSig(
        params.userId,
        params.transationId,
        params.amount,
        params.timestamptLimit,
        params.signature,
      ),
      'depositSig',
    );
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:deposit-sig1`];

export default func;
