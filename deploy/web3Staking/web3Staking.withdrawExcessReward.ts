import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toNumberDecimals } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3StakingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_STAKING_NAME} ${web3StakingAddress} is emergency withdrawing...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, web3StakingAddress);
    const { owner2WEB3Staking, user1ERC20Token, owner2Address } = context;
    const decimals = Number(await user1ERC20Token.decimals());

    console.log(`owner2Address: ${owner2Address}`);

    const contractBalance = await owner2WEB3Staking.getBalance();
    console.log(`${toNumberDecimals(contractBalance, decimals)} tokens in contract`);

    const excessReward = await owner2WEB3Staking.calculateExcessReward();
    console.log(`${toNumberDecimals(excessReward, decimals)} tokens in contract as excess reward`);

    await waitTx(owner2WEB3Staking.withdrawExcessReward(), 'withdrawExcessReward');
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:withdraw-excess-reward`];

export default func;
