import { expect } from 'chai';
import { contractConfig, seedData } from '~seeds';
import { getSQRTokenBalance } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    it('should be correct init values', async function () {
      expect(await this.ownerSQRStaking.owner()).eq(this.owner2Address);
      expect(await this.ownerSQRStaking.sqrToken()).eq(this.sqrTokenAddress);
      expect(await this.ownerSQRStaking.coldWallet()).eq(this.coldWalletAddress);
      expect(await this.ownerSQRStaking.balanceLimit()).eq(contractConfig.balanceLimit);
    });

    it('should be correct balances', async function () {
      expect(await getSQRTokenBalance(this, this.owner2Address)).eq(seedData.totalAccountBalance);
      expect(await this.ownerSQRStaking.getBalance()).eq(seedData.zero);
      expect(await this.ownerSQRStaking.totalBalance()).eq(seedData.zero);
    });
  });
}
