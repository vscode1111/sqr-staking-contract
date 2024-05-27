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
    const { user1Address, user1ERC20Token, user1SQRStaking } = context;

    const decimals = Number(await user1ERC20Token.decimals());

    const currentAllowance = await user1ERC20Token.allowance(user1Address, sqrStakingAddress);
    console.log(
      `${toNumberDecimals(
        currentAllowance,
        decimals,
      )} SQR was allowed ${await user1ERC20Token.getAddress()} contract`,
    );

    const params = {
      amount: deployData.stake1,
    };

    if (params.amount > currentAllowance) {
      const askAllowance = deployData.allowance;
      await waitTx(user1ERC20Token.approve(sqrStakingAddress, askAllowance), 'approve');
      console.log(
        `${toNumberDecimals(askAllowance, decimals)} SQR was approved to ${sqrStakingAddress}`,
      );
    }

    console.table(params);

    await waitTx(user1SQRStaking.stake(params.amount), 'stake');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:stake1`];

export default func;
