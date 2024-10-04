import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { sleep } from '~common';
import { callWithTimerHre, verifyContract } from '~common-contract';
import { WEB3_STAKING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getERC20TokenContext, getWEB3StakingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';
import { formatContractConfig, getContractArgsEx } from './utils';

const pauseTime = 10;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${WEB3_STAKING_NAME} is deploying...`);
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
    const { web3StakingAddress } = await getWEB3StakingContext(await getUsers(), contractConfig);
    console.log(`${WEB3_STAKING_NAME} deployed to ${web3StakingAddress}`);
    if (verifyRequired) {
      await verifyContract(web3StakingAddress, hre, getContractArgsEx());
      console.log(`${WEB3_STAKING_NAME} deployed and verified to ${web3StakingAddress}`);
    }
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:deploy`];

export default func;
