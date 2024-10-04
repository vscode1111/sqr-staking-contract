import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toNumberDecimals } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3StakingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_STAKING_NAME} ${web3StakingAddress} is staking...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, web3StakingAddress);
    const { user1Address, user1ERC20Token, user1WEB3Staking } = context;

    const decimals = Number(await user1ERC20Token.decimals());

    const currentAllowance = await user1ERC20Token.allowance(user1Address, web3StakingAddress);
    console.log(
      `${toNumberDecimals(
        currentAllowance,
        decimals,
      )} WEB3 was allowed ${await user1ERC20Token.getAddress()} contract`,
    );

    const params = {
      amount: deployData.stake1,
    };

    if (params.amount > currentAllowance) {
      const askAllowance = deployData.allowance;
      await waitTx(user1ERC20Token.approve(web3StakingAddress, askAllowance), 'approve');
      console.log(
        `${toNumberDecimals(askAllowance, decimals)} WEB3 was approved to ${web3StakingAddress}`,
      );
    }

    console.table(params);

    await waitTx(user1WEB3Staking.stake(params.amount), 'stake');
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:stake1`];

export default func;
