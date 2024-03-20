import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, toNumberDecimals, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is staking...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, sqrStakingAddress);
    const { user3Address, user3ERC20Token, user3SQRStaking } = context;

    const decimals = Number(await user3ERC20Token.decimals());

    const currentAllowance = await user3ERC20Token.allowance(user3Address, sqrStakingAddress);
    console.log(`${toNumberDecimals(currentAllowance, decimals)} SQR was allowed`);

    const params = {
      amount: deployData.stake3,
    };

    if (params.amount > currentAllowance) {
      const askAllowance = deployData.allowance;
      await waitTx(user3ERC20Token.approve(sqrStakingAddress, askAllowance), 'approve');
      console.log(
        `${toNumberDecimals(askAllowance, decimals)} SQR was approved to ${sqrStakingAddress}`,
      );
    }

    console.table(params);

    await waitTx(user3SQRStaking.stake(params.amount), 'stake');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:stake3`];

export default func;
