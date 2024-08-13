import { expect } from 'chai';
import { APR_DIVIDER, CONTRACT_NAME, CONTRACT_VERSION, YEAR_PERIOD } from '~constants';
import { seedData } from '~seeds';
import { loadSQRStakingFixture } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    beforeEach(async function () {
      await loadSQRStakingFixture(this);
    });

    it('should be correct init values', async function () {
      expect(await this.owner2SQRStaking.owner()).eq(this.owner2Address);
      expect(await this.owner2SQRStaking.getContractName()).eq(CONTRACT_NAME);
      expect(await this.owner2SQRStaking.getContractVersion()).eq(CONTRACT_VERSION);
      expect(await this.owner2SQRStaking.YEAR_PERIOD()).eq(YEAR_PERIOD);
      expect(await this.owner2SQRStaking.APR_DIVIDER()).eq(APR_DIVIDER);
      expect(await this.owner2SQRStaking.isStakeReady()).eq(true);
      expect(await this.owner2SQRStaking.getBalance()).eq(seedData.zero);
      expect(await this.owner2SQRStaking.getStakeCount()).eq(0);
      expect(await this.owner2SQRStaking.getStakerCount()).eq(0);
      expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.zero);
      expect(await this.owner2SQRStaking.totalClaimed()).eq(seedData.zero);
      expect(await this.owner2SQRStaking.totalWithdrawn()).eq(seedData.zero);
      expect(await this.owner2SQRStaking.totalReservedReward()).eq(seedData.zero);
      expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(seedData.zero);
      expect(await this.owner2SQRStaking.getStakeCountForUser(this.user2Address)).eq(seedData.zero);
      expect(await this.owner2SQRStaking.getStakeCountForUser(this.companyAddress)).eq(
        seedData.zero,
      );
      expect(
        await this.owner2SQRStaking.calculateMaxRewardForUser(
          this.user1Address,
          seedData.userStakeId1_0,
        ),
      ).eq(seedData.zero);
      expect(
        await this.owner2SQRStaking.calculateCurrentRewardForUser(
          this.user1Address,
          seedData.userStakeId1_0,
        ),
      ).eq(seedData.zero);
      const stakesData = await this.user1SQRStaking.fetchStakesForUser(this.user1Address);
      expect(stakesData.length).eq(0);

      const accountInfo1 = await this.user1SQRStaking.fetchAccountInfo(this.user1Address);
      expect(accountInfo1.stakeEntries).eql([]);
      expect(accountInfo1.totalStakedAmount).eq(0);

      const accountInfo2 = await this.user1SQRStaking.fetchAccountInfo(this.user2Address);
      expect(accountInfo2.stakeEntries).eql([]);
      expect(accountInfo2.totalStakedAmount).eq(0);
    });
  });
}
