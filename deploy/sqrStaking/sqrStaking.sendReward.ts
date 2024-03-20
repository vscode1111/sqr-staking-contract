import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common';
import { SQR_STAKING_NAME } from '~constants';
import { getAddressesFromHre, getContext, getUsers } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const users = await getUsers();
    const { companyAddress } = users;
    const { erc20TokenAddress, sqrStakingAddress } = getAddressesFromHre(hre);

    const context = await getContext(erc20TokenAddress, sqrStakingAddress);
    const { companyERC20Token } = context;

    const to = sqrStakingAddress;
    console.log(`${SQR_STAKING_NAME} ${companyAddress} transfers to ${to} ...`);

    const params = {
      to,
      amount: deployData.companyReward,
    };

    console.table(params);
    await waitTx(companyERC20Token.transfer(params.to, params.amount), 'transfer');
  }, hre);
};

func.tags = [`${SQR_STAKING_NAME}:send-reward`];

export default func;
