import { ContextBase } from '~types';
import { getSQRStakingContext, getSQRTokenContext, getUsers } from '~utils';

export async function deploySQRStakingContractFixture(): Promise<ContextBase> {
  const users = await getUsers();
  const { owner2Address } = users;

  const sqrTokenContext = await getSQRTokenContext(users);
  const { sqrTokenAddress } = sqrTokenContext;

  const sqrStakingContext = await getSQRStakingContext(users, {
    newOwner: owner2Address,
    sqrToken: sqrTokenAddress,
    // coldWallet: coldWalletAddress,
    // balanceLimit: contractConfig.balanceLimit,
  });

  return {
    ...users,
    ...sqrTokenContext,
    ...sqrStakingContext,
  };
}
