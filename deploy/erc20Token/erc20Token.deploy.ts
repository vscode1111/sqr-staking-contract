import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { sleep } from '~common';
import { callWithTimerHre, verifyContract } from '~common-contract';
import { ERC20_TOKEN_NAME } from '~constants';
import { getTokenArgs } from '~seeds';
import { getERC20TokenContext, getUsers } from '~utils';
import { deployTokenConfig, verifyRequired } from './deployData';

const pauseTime = 30;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${ERC20_TOKEN_NAME} is deploying...`);
    console.table(deployTokenConfig);
    console.log(`Pause ${pauseTime} sec to make sure...`);
    await sleep(pauseTime * 1000);

    console.log(`Deploying...`);
    const { owner2ERC20Token } = await getERC20TokenContext(await getUsers(), deployTokenConfig);
    console.log(`${ERC20_TOKEN_NAME} deployed to ${await owner2ERC20Token.getAddress()}`);
    if (verifyRequired) {
      await verifyContract(
        await owner2ERC20Token.getAddress(),
        hre,
        getTokenArgs(deployTokenConfig),
      );
      console.log(
        `${ERC20_TOKEN_NAME} deployed and verified to ${await owner2ERC20Token.getAddress()}`,
      );
    }
  }, hre);
};

func.tags = [`${ERC20_TOKEN_NAME}:deploy`];

export default func;
