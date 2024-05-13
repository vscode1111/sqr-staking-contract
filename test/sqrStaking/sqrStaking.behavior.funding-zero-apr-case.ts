import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Dayjs } from 'dayjs';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE, toUnixTime, toWei } from '~common';
import { DAYS } from '~constants';
import { ContractConfig, contractConfig, erc20Decimals, seedData } from '~seeds';
import { getERC20TokenBalance, loadSQRStakingFixture } from './utils';

const caseContractConfig: ContractConfig = {
  ...contractConfig,
  duration: 100 * DAYS,
  limit: toWei(500_000, erc20Decimals),
  apr: 0,
  maxStakeAmount: seedData.zero,
};

export function shouldBehaveCorrectFundingZeroAprCase(): void {
  describe('funding: zero apr case', () => {
    let chainTime: Dayjs;
    let calculatedReward = seedData.zero;

    beforeEach(async function () {
      await loadSQRStakingFixture(this, caseContractConfig, async (_chainTime, config) => {
        chainTime = _chainTime;
        return config;
      });
    });

    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
      expect(await this.owner2SQRStaking.apr()).eq(0);
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

      describe('user1 is allowed to stake more than maximum amount', () => {
        beforeEach(async function () {
          await this.user1SQRStaking.stake(caseContractConfig.limit);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(1);
          expect(await this.owner2SQRStaking.totalStaked()).eq(caseContractConfig.limit);
          expect(await this.owner2SQRStaking.getStakeCount()).eq(1);
        });

        describe('user1 unstaked tokens', () => {
          beforeEach(async function () {
            await time.increaseTo(
              toUnixTime(
                chainTime.add(caseContractConfig.duration + seedData.timeDelta, 'seconds').toDate(),
              ),
            );
            await this.user1SQRStaking.unstake(seedData.userStakeId1_0);
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.owner2SQRStaking.getBalance()).closeTo(
              seedData.zero,
              seedData.tokenMicroDelta,
            );

            expect(await this.owner2SQRStaking.totalWithdrawn()).closeTo(
              caseContractConfig.limit + calculatedReward,
              seedData.tokenMicroDelta,
            );
          });
        });
      });
    });
  });
}
