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
    const { user3Address, user1ERC20Token, user3WEB3Staking } = context;

    const decimals = Number(await user1ERC20Token.decimals());

    const currentAllowance = await user1ERC20Token.allowance(user3Address, web3StakingAddress);
    console.log(`${toNumberDecimals(currentAllowance, decimals)} WEB3 was allowed`);

    const params = {
      userStakeId: deployData.userStakeId2_0,
    };

    console.table(params);

    await waitTx(user3WEB3Staking.unstake(params.userStakeId), 'unstake');
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:unstake3`];

export default func;
