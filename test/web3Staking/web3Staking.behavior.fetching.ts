import { expect } from 'chai';
import { APR_DIVIDER, CONTRACT_NAME, CONTRACT_VERSION, YEAR_PERIOD } from '~constants';
import { seedData } from '~seeds';
import { loadWEB3StakingFixture } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    beforeEach(async function () {
      await loadWEB3StakingFixture(this);
    });

    it('should be correct init values', async function () {
      expect(await this.owner2WEB3Staking.owner()).eq(this.owner2Address);
      expect(await this.owner2WEB3Staking.getContractName()).eq(CONTRACT_NAME);
      expect(await this.owner2WEB3Staking.getContractVersion()).eq(CONTRACT_VERSION);
      expect(await this.owner2WEB3Staking.YEAR_PERIOD()).eq(YEAR_PERIOD);
      expect(await this.owner2WEB3Staking.APR_DIVIDER()).eq(APR_DIVIDER);
      expect(await this.owner2WEB3Staking.isStakeReady()).eq(true);
      expect(await this.owner2WEB3Staking.getBalance()).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.getStakeCount()).eq(0);
      expect(await this.owner2WEB3Staking.getStakerCount()).eq(0);
      expect(await this.owner2WEB3Staking.totalStaked()).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.totalClaimed()).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.totalWithdrawn()).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.totalReservedReward()).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.getStakeCountForUser(this.user1Address)).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.getStakeCountForUser(this.user2Address)).eq(seedData.zero);
      expect(await this.owner2WEB3Staking.getStakeCountForUser(this.companyAddress)).eq(
        seedData.zero,
      );
      expect(
        await this.owner2WEB3Staking.calculateMaxRewardForUser(
          this.user1Address,
          seedData.userStakeId1_0,
        ),
      ).eq(seedData.zero);
      expect(
        await this.owner2WEB3Staking.calculateCurrentRewardForUser(
          this.user1Address,
          seedData.userStakeId1_0,
        ),
      ).eq(seedData.zero);
      const stakesData = await this.user1WEB3Staking.fetchStakesForUser(this.user1Address);
      expect(stakesData.length).eq(0);

      const accountInfo1 = await this.user1WEB3Staking.fetchAccountInfo(this.user1Address);
      expect(accountInfo1.stakeEntries).eql([]);
      expect(accountInfo1.totalStakedAmount).eq(0);

      const accountInfo2 = await this.user1WEB3Staking.fetchAccountInfo(this.user2Address);
      expect(accountInfo2.stakeEntries).eql([]);
      expect(accountInfo2.totalStakedAmount).eq(0);
    });
  });
}
