import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toNumberDecimals } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is emergency withdrawing...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, sqrStakingAddress);
    const { owner2SQRStaking, user1ERC20Token, owner2Address } = context;
    const decimals = Number(await user1ERC20Token.decimals());

    console.log(`owner2Address: ${owner2Address}`);

    const contractBalance = await owner2SQRStaking.getBalance();
    console.log(`${toNumberDecimals(contractBalance, decimals)} tokens in contract`);

    const excessReward = await owner2SQRStaking.calculateExcessReward();
    console.log(`${toNumberDecimals(excessReward, decimals)} tokens in contract as excess reward`);

    await waitTx(owner2SQRStaking.withdrawExcessReward(), 'withdrawExcessReward');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:withdraw-excess-reward`];

export default func;
