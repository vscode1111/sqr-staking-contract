import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Dayjs } from 'dayjs';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE, toUnixTime, toWei } from '~common';
import { DAYS } from '~constants';
import { ContractConfig, contractConfig, erc20Decimals, seedData } from '~seeds';
import { calculateAprForContract } from '~utils';
import { getERC20TokenBalance, loadWEB3StakingFixture } from './utils';

const caseContractConfig: ContractConfig = {
  ...contractConfig,
  duration: 365 * DAYS,
  depositDeadline: 1000 * DAYS,
  limit: seedData.zero,
  apr: calculateAprForContract(20),
  maxStakeAmount: seedData.zero,
};

const caseSettings = {
  contractInitBalance: toWei(500, erc20Decimals),
  stake1: toWei(1000, erc20Decimals),
  stake2: toWei(1000, erc20Decimals),
  claimDuration1: (365 * DAYS) / (200 / 25),
  targetClaim1: toWei(25, erc20Decimals),
  targetTotalWithdrawn: toWei(25, erc20Decimals),
  targetCurrentStakedReward1: toWei(200, erc20Decimals),
  targetCurrentStakedReward2: toWei(400, erc20Decimals),
  targetExcessReward: toWei(100, erc20Decimals),
};

export function shouldBehaveCorrectFundingWithdrawExcessRewardCase(): void {
  describe('funding: case withdraw excess reward', () => {
    let chainTime: Dayjs;

    beforeEach(async function () {
      await loadWEB3StakingFixture(this, caseContractConfig, async (_chainTime, config) => {
        chainTime = _chainTime;
        const depositDeadline = toUnixTime(chainTime.add(100, 'days').toDate());

        return {
          ...config,
          depositDeadline,
        };
      });
    });

    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
      const duration = await this.owner2WEB3Staking.duration();
      expect(duration).eq(caseContractConfig.duration);
    });

    describe('user1 and user2 have tokens and approved contract to use them and contract has tokens for rewards', () => {
      beforeEach(async function () {
        await this.owner2ERC20Token.transfer(this.user1Address, caseSettings.stake1);
        await this.user1ERC20Token.approve(this.web3StakingAddress, caseSettings.stake1);
        await this.owner2ERC20Token.transfer(this.user2Address, caseSettings.stake2);
        await this.user2ERC20Token.approve(this.web3StakingAddress, caseSettings.stake2);

        await this.owner2ERC20Token.transfer(
          this.web3StakingAddress,
          caseSettings.contractInitBalance,
        );
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await this.ownerWEB3Staking.getBalance()).eq(caseSettings.contractInitBalance);

        expect(await this.owner2WEB3Staking.totalStaked()).eq(seedData.zero);

        expect(await getERC20TokenBalance(this, this.user1Address)).eq(caseSettings.stake1);

        expect(await this.owner2WEB3Staking.getStakeCountForUser(this.user1Address)).eq(
          seedData.zero,
        );
      });

      describe('user1 is allowed to stake more than maximum amount', () => {
        beforeEach(async function () {
          await this.user1WEB3Staking.stake(caseSettings.stake1);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.ownerWEB3Staking.getBalance()).eq(
            caseSettings.contractInitBalance + caseSettings.stake1,
          );
          expect(await this.owner2WEB3Staking.totalStaked()).eq(caseSettings.stake1);
          expect(await this.owner2WEB3Staking.totalWithdrawn()).eq(seedData.zero);
        });

        describe('user1 unstaked tokens', () => {
          beforeEach(async function () {
            await time.increaseTo(
              toUnixTime(chainTime.add(caseSettings.claimDuration1, 'seconds').toDate()),
            );
            await this.user1WEB3Staking.claim(seedData.userStakeId1_0);
            await this.user2WEB3Staking.stake(caseSettings.stake2);
            await time.increaseTo(
              toUnixTime(chainTime.add(caseContractConfig.duration, 'seconds').toDate()),
            );
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.ownerWEB3Staking.getBalance()).closeTo(
              caseSettings.contractInitBalance +
                caseSettings.stake1 +
                caseSettings.stake2 -
                caseSettings.targetClaim1,
              seedData.tokenDelta,
            );
            expect(await this.owner2WEB3Staking.totalStaked()).eq(
              caseSettings.stake1 + caseSettings.stake2,
            );
            expect(await this.owner2WEB3Staking.totalWithdrawn()).closeTo(
              caseSettings.targetClaim1,
              seedData.tokenDelta,
            );
            expect(await this.owner2WEB3Staking.totalWithdrawn()).closeTo(
              caseSettings.targetTotalWithdrawn,
              seedData.tokenDelta,
            );
            expect(await this.owner2WEB3Staking.calculateExcessReward()).eq(
              caseSettings.targetExcessReward,
            );
            expect(await this.owner2WEB3Staking.calculateRequiredReward()).eq(seedData.zero);
          });
        });
      });
    });
  });
}
