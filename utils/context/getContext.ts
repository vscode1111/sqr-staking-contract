import { ContextBase } from '~types';
import { getERC20TokenContext } from './getERC20TokenContext';
import { getSQRStakingContext } from './getSQRStakingContext';
import { getUsers } from './getUsers';

export async function getContext(
  erc20TokenAddress: string,
  sqrStakingAddress: string,
): Promise<ContextBase> {
  const users = await getUsers();
  const erc20TokenContext = await getERC20TokenContext(users, erc20TokenAddress);
  const sqrStakingContext = await getSQRStakingContext(users, sqrStakingAddress);

  return {
    ...users,
    ...erc20TokenContext,
    ...sqrStakingContext,
  };
}
