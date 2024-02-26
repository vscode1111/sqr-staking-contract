import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig, seedData } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is depositing...`);
    const sqrTokenAddress = contractConfig.sqrToken;
    const context = await getContext(sqrTokenAddress, sqrStakingAddress);
    const { user2Address, user1SQRToken, user2SQRStaking } = context;

    const decimals = Number(await user1SQRToken.decimals());

    const currentAllowance = await user1SQRToken.allowance(user2Address, sqrStakingAddress);
    console.log(`${toNumberDecimals(currentAllowance, decimals)} SQR was allowed`);

    const body = {
      userId: '1065471',
      transactionId: '6baee13d-cd19-4c25-935f-7a09fe66813e',
      amount: 0.01,
    };

    const response = {
      signature:
        '0xcd5043673f5c5a602d3455da8d7ebc8097e9e54629ea2e5af01f75dd525be0d17f597debe2e811f6c3c84b630f5c2f5ae5c35a196b48e7850c7462cebc18da1e1b',
      amountInWei: '1000000',
      timestampNow: 1708679635,
      timestampLimit: 1708680235,
    };

    const params = {
      userId: body.userId,
      transationId: body.transactionId,
      amount: BigInt(response.amountInWei),
      timestamptLimit: response.timestampLimit,
      signature: response.signature,
    };

    if (params.amount > currentAllowance) {
      const askAllowance = seedData.allowance;
      await waitTx(user1SQRToken.approve(sqrStakingAddress, askAllowance), 'approve');
      console.log(
        `${toNumberDecimals(askAllowance, decimals)} SQR was approved to ${sqrStakingAddress}`,
      );
    }

    console.table(params);

    await waitTx(
      user2SQRStaking.depositSig(
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

func.tags = [`${SQR_STAKING_NAME}:deposit-sig1-manual`];

export default func;
