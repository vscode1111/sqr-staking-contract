import { ContractConfig, contractConfig } from '~seeds';
import { ContextBase } from '~types';
import { getERC20TokenContext, getSQRStakingContext, getUsers } from '~utils';

export async function deploySQRStakingContractFixture(
  contractConfigParam?: Partial<ContractConfig>,
): Promise<ContextBase> {
  const users = await getUsers();
  const { owner2Address } = users;

  const erc20TokenContext = await getERC20TokenContext(users);
  const { erc20TokenAddress } = erc20TokenContext;

  const config: ContractConfig = {
    ...contractConfig,
    ...contractConfigParam,
    newOwner: owner2Address,
    erc20Token: erc20TokenAddress,
  };

  const sqrStakingContext = await getSQRStakingContext(users, config);

  return {
    ...users,
    ...erc20TokenContext,
    ...sqrStakingContext,
  };
}
