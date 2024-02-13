import { expect } from 'chai';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE, waitTx } from '~common';
import { StakingTypeID, seedData } from '~seeds';
import { errorMessage } from './testData';
import { StakeEventArgs } from './types';
import { checkTotalSQRBalance, findEvent, getSQRTokenBalance } from './utils';

export function shouldBehaveCorrectFunding(): void {
  describe('funding', () => {
    beforeEach(async function () {
      await checkTotalSQRBalance(this);
    });

    afterEach(async function () {
      await checkTotalSQRBalance(this);
    });

    it('user1 tries to stake zero amount', async function () {
      await expect(
        this.user1SQRStaking.stake(seedData.zero, StakingTypeID.Type30Days),
      ).revertedWith(errorMessage.youCantStakeThatFewTokens);
    });

    it('user1 tries to stake without allowence', async function () {
      await expect(
        this.user1SQRStaking.stake(seedData.stake1, StakingTypeID.Type30Days),
      ).revertedWith(errorMessage.userMustAllowToUseOfFund);
    });

    it('user1 tries to stake with allowence but no funds', async function () {
      await this.user1SQRToken.approve(this.sqrStakingAddress, seedData.extraStake1);

      await expect(
        this.user1SQRStaking.stake(seedData.stake1, StakingTypeID.Type30Days),
      ).revertedWith(errorMessage.userMustHaveFunds);
    });

    it('user2 tries to stake without allowence', async function () {
      await expect(
        this.user2SQRStaking.stake(seedData.stake2, StakingTypeID.Type30Days),
      ).revertedWith(errorMessage.userMustAllowToUseOfFund);
    });

    describe('user1 and user2 have tokens and approved contract to use these', () => {
      beforeEach(async function () {
        await this.owner2SQRToken.transfer(this.user1Address, seedData.userInitBalance);
        await this.user1SQRToken.approve(this.sqrStakingAddress, seedData.stake1);

        await this.owner2SQRToken.transfer(this.user2Address, seedData.userInitBalance);
        await this.user2SQRToken.approve(this.sqrStakingAddress, seedData.stake2);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await getSQRTokenBalance(this, this.user1Address)).eq(seedData.userInitBalance);
        expect(await getSQRTokenBalance(this, this.user2Address)).eq(seedData.userInitBalance);
      });

      it('user1 is allowed to stake (check event)', async function () {
        const receipt = await waitTx(
          this.user1SQRStaking.stake(seedData.stake1, StakingTypeID.Type30Days),
        );
        const eventLog = findEvent<StakeEventArgs>(receipt);

        expect(eventLog).not.undefined;
        const [id, PNLamount, PNLgAmount, user] = eventLog?.args;
        expect(id).eq(1);
        expect(PNLamount).eq(seedData.stake1);
        expect(PNLgAmount).eq(seedData.zero);
        expect(user).eq(this.user1Address);
      });
    });
  });
}
