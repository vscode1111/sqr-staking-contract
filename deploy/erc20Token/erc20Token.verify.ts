import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common';
import { ERC20_TOKEN_NAME } from '~constants';
import { getTokenArgs } from '~seeds';
import { getAddressesFromHre } from '~utils';
import { deployTokenConfig } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { erc20TokenAddress } = await getAddressesFromHre(hre);
    console.log(`${ERC20_TOKEN_NAME} ${erc20TokenAddress} is verify...`);
    await verifyContract(erc20TokenAddress, hre, getTokenArgs(deployTokenConfig));
  }, hre);
};

func.tags = [`${ERC20_TOKEN_NAME}:verify`];

export default func;
