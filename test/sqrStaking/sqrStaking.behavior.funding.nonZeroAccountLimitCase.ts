import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Dayjs } from 'dayjs';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE, toUnixTime } from '~common';
import { ContractConfig, contractConfig, seedData } from '~seeds';
import { calculateAprInNumber, calculateReward } from '~utils';
import { errorMessage } from './testData';
import { getERC20TokenBalance, loadSQRStakingFixture } from './utils';

const caseContractConfig: ContractConfig = {
  ...contractConfig,
  accountLimit: seedData.stake1 * BigInt(2),
};

export function shouldBehaveCorrectFundingNonZeroAccountLimitCase(): void {
  describe('funding: non-zero account limit case', () => {
    let chainTime: Dayjs;

    beforeEach(async function () {
      await loadSQRStakingFixture(this, caseContractConfig, async (_chainTime, config) => {
        chainTime = _chainTime;
        return config;
      });
    });

    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
      expect(await this.owner2SQRStaking.apr()).eq(200);
    });

    describe('user1 and user2 have tokens and approved contract to use them and contract has tokens for rewards', () => {
      beforeEach(async function () {
        await this.owner2ERC20Token.transfer(this.user1Address, caseContractConfig.limit);
        await this.user1ERC20Token.approve(this.sqrStakingAddress, caseContractConfig.limit);
        await this.owner2ERC20Token.transfer(this.user2Address, caseContractConfig.limit);
        await this.user2ERC20Token.approve(this.sqrStakingAddress, caseContractConfig.limit);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await getERC20TokenBalance(this, this.user1Address)).eq(caseContractConfig.limit);
        expect(await getERC20TokenBalance(this, this.user2Address)).eq(caseContractConfig.limit);

        expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(
          seedData.zero,
        );
        expect(await this.owner2SQRStaking.getStakeCountForUser(this.user2Address)).eq(
          seedData.zero,
        );
      });

      describe('user1 and user2 are allowed to stake more than maximum amount', () => {
        beforeEach(async function () {
          await this.user1SQRStaking.stake(seedData.stake1);
          await this.user2SQRStaking.stake(seedData.stake1);
        });

        it('user1 and user2 try to stake third time', async function () {
          expect(
            (await this.user1SQRStaking.fetchAccountInfo(this.user1Address)).totalStakedAmount,
          ).eq(seedData.stake1);
          await this.user1SQRStaking.stake(seedData.stake1);
          expect(
            (await this.user1SQRStaking.fetchAccountInfo(this.user1Address)).totalStakedAmount,
          ).eq(seedData.stake1 * BigInt(2));

          await expect(this.user1SQRStaking.stake(seedData.stake1)).revertedWith(
            errorMessage.userStakeLimitIsOver,
          );

          expect(
            (await this.user2SQRStaking.fetchAccountInfo(this.user2Address)).totalStakedAmount,
          ).eq(seedData.stake1);
          await this.user2SQRStaking.stake(seedData.stake1);
          expect(
            (await this.user2SQRStaking.fetchAccountInfo(this.user2Address)).totalStakedAmount,
          ).eq(seedData.stake1 * BigInt(2));
          await expect(this.user2SQRStaking.stake(seedData.stake1)).revertedWith(
            errorMessage.userStakeLimitIsOver,
          );
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(1);
          expect(await this.owner2SQRStaking.getStakeCountForUser(this.user2Address)).eq(1);
          expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.stake1 * BigInt(2));
          expect(await this.owner2SQRStaking.getStakeCount()).eq(2);
          expect(
            (await this.user1SQRStaking.fetchAccountInfo(this.user1Address)).totalStakedAmount,
          ).eq(seedData.stake1);
          expect(
            (await this.user2SQRStaking.fetchAccountInfo(this.user2Address)).totalStakedAmount,
          ).eq(seedData.stake1);
        });

        describe('user1 and user2 unstaked tokens', () => {
          beforeEach(async function () {
            await time.increaseTo(
              toUnixTime(
                chainTime.add(caseContractConfig.duration + seedData.timeDelta, 'seconds').toDate(),
              ),
            );
            const requiredReward = await this.owner2SQRStaking.calculateRequiredReward();
            await this.owner2ERC20Token.transfer(this.sqrStakingAddress, requiredReward);

            await this.user1SQRStaking.unstake(seedData.userStakeId1_0);
            await this.user2SQRStaking.unstake(seedData.userStakeId2_0);
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.owner2SQRStaking.getBalance()).closeTo(
              seedData.zero,
              seedData.tokenMicroDelta,
            );

            const totalStake = seedData.stake1 * BigInt(2);

            const calculatedReward = calculateReward(
              totalStake,
              calculateAprInNumber(caseContractConfig.apr),
              caseContractConfig.duration,
            );

            expect(await this.owner2SQRStaking.totalWithdrawn()).closeTo(
              totalStake + calculatedReward,
              seedData.tokenMicroDelta,
            );
          });
        });
      });
    });
  });
}
