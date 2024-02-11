import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { contractConfig } from '~seeds';
import { getSQRStakingContext, getUsers } from '~utils';
import { errorMessage } from '.';

export function shouldBehaveCorrectControl(): void {
  describe('control', () => {
    it('owner tries to deploy with zero new owner address', async function () {
      const users = await getUsers();
      await expect(
        getSQRStakingContext(users, {
          ...contractConfig,
          newOwner: ZeroAddress,
        }),
      ).revertedWith(errorMessage.newOwnerAddressCantBeZero);
    });

    it('owner tries to deploy with zero SQR token address', async function () {
      const users = await getUsers();
      await expect(
        getSQRStakingContext(users, {
          ...contractConfig,
          sqrToken: ZeroAddress,
        }),
      ).revertedWith(errorMessage.sqrTokeAddressCantBeZero);
    });
  });
}
