import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { sleep } from '~common';
import { callWithTimerHre, verifyContract } from '~common-contract';
import { SQR_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getERC20TokenContext, getSQRStakingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';
import { formatContractConfig, getContractArgsEx } from './utils';

const pauseTime = 10;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${SQR_STAKING_NAME} is deploying...`);
    const users = await getUsers();
    const { erc20Token } = contractConfig;
    const { owner2ERC20Token } = await getERC20TokenContext(users, erc20Token);
    const [decimals, tokenName] = await Promise.all([
      owner2ERC20Token.decimals(),
      owner2ERC20Token.name(),
    ]);

    console.table(formatContractConfig(contractConfig, decimals, tokenName));
    console.log(`Pause ${pauseTime} sec to make sure...`);
    await sleep(pauseTime * 1000);

    console.log(`Deploying...`);
    const { sqrStakingAddress } = await getSQRStakingContext(await getUsers(), contractConfig);
    console.log(`${SQR_STAKING_NAME} deployed to ${sqrStakingAddress}`);
    if (verifyRequired) {
      await verifyContract(sqrStakingAddress, hre, getContractArgsEx());
      console.log(`${SQR_STAKING_NAME} deployed and verified to ${sqrStakingAddress}`);
    }
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:deploy`];

export default func;
