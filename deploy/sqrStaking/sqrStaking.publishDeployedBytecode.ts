import appRoot from 'app-root-path';
import { readFileSync, writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { checkFilePathSync, getParentDirectory } from '~common';
import { callWithTimerHre } from '~common-contract';
import { SQR_STAKING_NAME } from '~constants';
import { getSourcePath } from './utils';

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimerHre(async () => {
    const root = appRoot.toString();
    const sourcePath = getSourcePath(SQR_STAKING_NAME);

    const file = readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });
    const jsonFile = JSON.parse(file);

    const deployedBytecode = jsonFile.deployedBytecode;
    const targetPath = `${root}/deployed-bytecode/${SQR_STAKING_NAME}.bin`;
    checkFilePathSync(getParentDirectory(targetPath));
    writeFileSync(targetPath, deployedBytecode);

    console.log(`Deployed Bytecode was saved to ${targetPath}`);
  });
};

func.tags = [`${SQR_STAKING_NAME}:publish-deployed-bytecode`];

export default func;
