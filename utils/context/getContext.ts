import { ContextBase } from '~types';
import { getERC20TokenContext } from './getERC20TokenContext';
import { getWEB3StakingContext } from './getWEB3StakingContext';
import { getUsers } from './getUsers';

export async function getContext(
  erc20TokenAddress: string,
  web3StakingAddress: string,
): Promise<ContextBase> {
  const users = await getUsers();
  const erc20TokenContext = await getERC20TokenContext(users, erc20TokenAddress);
  const web3StakingContext = await getWEB3StakingContext(users, web3StakingAddress);

  return {
    ...users,
    ...erc20TokenContext,
    ...web3StakingContext,
  };
}
