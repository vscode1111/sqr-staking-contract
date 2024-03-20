import { readFileSync } from 'fs';
import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { getSourcePath, makeChalk } from './utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const chalk = await makeChalk();
    const info = chalk.green;
    const error = chalk.red;

    const { sqrStakingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_STAKING_NAME} ${sqrStakingAddress} is checking deployed bytecode...`);

    const sourcePath = getSourcePath(SQR_STAKING_NAME);

    const contractDeployedBytecode = await ethers.provider.getCode(sqrStakingAddress);

    const file = readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });
    const jsonFile = JSON.parse(file);

    const sourceDeployedBytecode = jsonFile.deployedBytecode;

    if (sourceDeployedBytecode === contractDeployedBytecode) {
      console.log(info('Deployed bytecode is correct'));
    } else {
      console.log(error(`Deployed bytecode is not correct`));
    }
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:check-deployed-bytecode`];

export default func;
