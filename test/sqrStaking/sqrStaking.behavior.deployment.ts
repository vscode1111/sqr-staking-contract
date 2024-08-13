import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { contractConfig, seedData } from '~seeds';
import { getSQRStakingContext, getUsers } from '~utils';
import { customError, errorMessage } from '.';

export function shouldBehaveCorrectDeployment(): void {
  describe('control', () => {
    it('owner tries to deploy with zero new owner address', async function () {
      const users = await getUsers();

      const { owner2SQRStaking } = await getSQRStakingContext(users, contractConfig);

      await expect(
        getSQRStakingContext(users, {
          ...contractConfig,
          newOwner: ZeroAddress,
        }),
      ).revertedWithCustomError(owner2SQRStaking, customError.ownableInvalidOwner);
    });

    it('owner tries to deploy with zero ERC20 token address', async function () {
      const users = await getUsers();
      await expect(
        getSQRStakingContext(users, {
          ...contractConfig,
          erc20Token: ZeroAddress,
        }),
      ).revertedWith(errorMessage.erc20TokeAddressCantBeZero);
    });

    it('owner tries to deploy with zero duration', async function () {
      const users = await getUsers();
      await expect(
        getSQRStakingContext(users, {
          ...contractConfig,
          duration: 0,
        }),
      ).revertedWith(errorMessage.durationMustBeGreaterThanZero);
    });

    it('owner tries to deploy with depositDeadline near to current time', async function () {
      const users = await getUsers();
      await expect(
        getSQRStakingContext(users, {
          ...contractConfig,
          depositDeadline: seedData.now,
        }),
      ).revertedWith(errorMessage.depositDeadlineMustBeGreaterThanCurrentTime);
    });
  });
}
