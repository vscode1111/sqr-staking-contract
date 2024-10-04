import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
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
    const { user1WEB3Staking } = context;

    const params = {
      userStakeId: deployData.userStakeId1_0,
    };

    console.table(params);

    await waitTx(user1WEB3Staking.claim(params.userStakeId), 'claim');
  }, hre);
};

func.tags = [`${WEB3_STAKING_NAME}:claim1`];

export default func;
