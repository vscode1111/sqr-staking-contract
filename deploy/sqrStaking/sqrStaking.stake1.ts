import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { StakingTypeID, contractConfig, seedData } from '~seeds';
import { getAddressesFromHre, getContext, signMessageForStake } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is staking...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { owner2, user1Address, user1SQRToken, user1SQRStaking } = context;

    const decimals = Number(await user1SQRToken.decimals());

    const currentAllowance = await user1SQRToken.allowance(user1Address, sqrStakingAddress);
    console.log(`${toNumberDecimals(currentAllowance, decimals)} SQR was allowed`);

    const params = {
      amount: seedData.stake1,
      stakingTypeId: StakingTypeID.Type10Minutes,
      stakingID: seedData.skakeTransationId1,
      userID: seedData.userId1,
      timestampLimit: seedData.nowPlus1m,
      signature: '',
    };

    params.signature = await signMessageForStake(owner2, user1Address, seedData.nowPlus1m);

    if (params.amount > currentAllowance) {
      const askAllowance = seedData.allowance;
      await waitTx(user1SQRToken.approve(sqrStakingAddress, askAllowance), 'approve');
      console.log(
        `${toNumberDecimals(askAllowance, decimals)} SQR was approved to ${sqrStakingAddress}`,
      );
    }

    console.table(params);

    await waitTx(
      user1SQRStaking.stakeSig(
        params.stakingTypeId,
        params.userID,
        params.stakingID,
        params.amount,
        params.timestampLimit,
        params.signature,
      ),
      'stakeSig',
    );
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:stake1`];

export default func;
