import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common-contract';
import { WEB3_STAKING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { getContractArgsEx } from './utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3StakingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_STAKING_NAME} ${web3StakingAddress} is verify...`);
    const contractArg = getContractArgsEx();
    console.table(contractArg);
    await verifyContract(web3StakingAddress, hre, contractArg);
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:verify`];

export default func;
