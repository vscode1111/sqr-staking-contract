import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Dayjs } from 'dayjs';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE, toUnixTime, waitTx } from '~common';
import { contractConfig, seedData } from '~seeds';
import { calculateAprInNumber, calculateReward } from '~utils';
import {
  ClaimEventArgs,
  StakeEventArgs,
  UnstakeEventArgs,
  WithdrawExcessRewardEventArgs,
  errorMessage,
} from '.';
import {
  addSeedSeconds,
  checkTotalSQRBalance,
  findEvent,
  getContractBalanceDiff,
  getERC20TokenBalance,
  loadSQRStakingFixture,
} from './utils';

const caseSettings = {
  claimDuration: contractConfig.duration / 3,
};

export function shouldBehaveCorrectFundingDefaultCase(): void {
  describe('funding: default case', () => {
    let chainTime: Dayjs;

    beforeEach(async function () {
      await loadSQRStakingFixture(this, contractConfig, async (_chainTime, config) => {
        chainTime = _chainTime;
        return config;
      });
    });

    afterEach(async function () {
      await checkTotalSQRBalance(this);
    });

    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
      expect(await this.owner2SQRStaking.isStakeReady()).eq(true);
      expect(await this.owner2SQRStaking.duration()).eq(contractConfig.duration);
      expect(await this.owner2SQRStaking.isStakeReady()).eq(true);
    });

    it('user1 tries to stake without allowence', async function () {
      await expect(this.user1SQRStaking.stake(seedData.stake1)).revertedWith(
        errorMessage.userMustAllowToUseOfFund,
      );
    });

    it('user1 tries to stake with allowence but no funds', async function () {
      await this.user1ERC20Token.approve(this.sqrStakingAddress, seedData.extraStake1);
      await expect(this.user1SQRStaking.stake(seedData.stake1)).revertedWith(
        errorMessage.userMustHaveFunds,
      );
    });

    it('user2 tries to stake without allowence', async function () {
      await expect(this.user2SQRStaking.stake(seedData.stake2)).revertedWith(
        errorMessage.userMustAllowToUseOfFund,
      );
    });

    it('user1 tries to stake when deposit deadline is over', async function () {
      const depositDeadline = addSeedSeconds(chainTime, contractConfig.depositDeadline);
      await time.increaseTo(depositDeadline);
      await expect(this.user1SQRStaking.stake(seedData.stake1)).revertedWith(
        errorMessage.depositDeadlineIsOver,
      );
    });

    describe('user1 and user2 have tokens and approved contract to use them', () => {
      beforeEach(async function () {
        await this.owner2ERC20Token.transfer(this.user1Address, seedData.userInitBalance);
        await this.user1ERC20Token.approve(this.sqrStakingAddress, seedData.userInitBalance);
        await this.owner2ERC20Token.transfer(this.user2Address, seedData.userInitBalance);
        await this.user2ERC20Token.approve(this.sqrStakingAddress, seedData.userInitBalance);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await getERC20TokenBalance(this, this.user1Address)).eq(seedData.userInitBalance);
        expect(await getERC20TokenBalance(this, this.user2Address)).eq(seedData.userInitBalance);

        expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(
          seedData.zero,
        );
        expect(await this.owner2SQRStaking.getStakeCountForUser(this.user2Address)).eq(
          seedData.zero,
        );
      });

      it('user1 tries to stake zero amount', async function () {
        await expect(this.user1SQRStaking.stake(seedData.zero)).revertedWith(
          errorMessage.amountMustBeGreaterThanZero,
        );
      });

      it('user1 tries to stake min amount', async function () {
        await expect(this.user1SQRStaking.stake(seedData.minStake)).revertedWith(
          errorMessage.youCantStakeThatMinimumAmount,
        );
      });

      it('user1 tries to stake more than maximum amount', async function () {
        await expect(this.user1SQRStaking.stake(seedData.maximumStake)).revertedWith(
          errorMessage.youCantStakeThatMaximumAmount,
        );
      });

      it('user1 tries to stake over limit', async function () {
        for (let i = 0; i < 3; i++) {
          await this.user1SQRStaking.stake(seedData.extraStake1);
        }

        await expect(this.user1SQRStaking.stake(seedData.stake1)).revertedWith(
          errorMessage.stakeLimitIsOver,
        );
      });

      it('user1 is allowed to stake (check event)', async function () {
        const receipt = await waitTx(this.user1SQRStaking.stake(seedData.stake1));
        const eventLog = findEvent<StakeEventArgs>(receipt);
        expect(eventLog).not.undefined;
        const [user, userStakeId, amount] = eventLog?.args;
        expect(user).eq(this.user1Address);
        expect(userStakeId).eq(0);
        expect(amount).eq(seedData.stake1);
      });

      describe('user1 staked tokens', () => {
        beforeEach(async function () {
          await this.user1SQRStaking.stake(seedData.stake1);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.owner2SQRStaking.getStakeCount()).eq(1);
          expect(await this.owner2SQRStaking.getStakerCount()).eq(1);
          expect(await this.owner2SQRStaking.getBalance()).eq(seedData.stake1);
          expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(1);
          expect(await this.owner2SQRStaking.calculateExcessReward()).eq(seedData.zero);
          expect(await this.owner2SQRStaking.calculateRequiredReward()).greaterThan(seedData.zero);

          const maxReward1 = calculateReward(
            seedData.stake1,
            calculateAprInNumber(contractConfig.apr),
            contractConfig.duration,
          );

          expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.stake1);
          expect(await this.owner2SQRStaking.totalClaimed()).eq(seedData.zero);
          expect(await this.owner2SQRStaking.totalWithdrawn()).eq(seedData.zero);
          expect(await this.owner2SQRStaking.totalReservedReward()).eq(maxReward1);
          expect(
            await this.owner2SQRStaking.calculateMaxRewardForUser(
              this.user1Address,
              seedData.userStakeId1_0,
            ),
          ).eq(maxReward1);

          const stakes = await this.user1SQRStaking.fetchStakesForUser(this.user1Address);
          expect(stakes.length).eq(1);
          const stake = stakes[0];
          const { stakedAmount, claimedAmount, stakedAt, withdrawn } = stake;
          expect(stakedAmount).eq(seedData.stake1);
          expect(claimedAmount).eq(seedData.zero);
          expect(stakedAt).closeTo(seedData.now, seedData.timeDelta);
          expect(withdrawn).eq(false);
        });

        it('user1 tries to claim zero reward', async function () {
          await expect(this.user1SQRStaking.claim(seedData.userStakeId1_0)).revertedWith(
            errorMessage.youHaveNoReward,
          );
        });

        it('user1 tries to claim zero reward', async function () {
          const increaseTo = addSeedSeconds(chainTime, caseSettings.claimDuration);
          await time.increaseTo(increaseTo);
          await expect(this.user1SQRStaking.claim(seedData.userStakeId1_0)).revertedWith(
            errorMessage.contractHasNoTokensForClaiming,
          );
        });

        it('user1 tries to unstake non-existent stake', async function () {
          await expect(this.user1SQRStaking.unstake(seedData.stakeIdNonExistent)).revertedWith(
            errorMessage.stakeDataIsntFound,
          );
        });

        it('user1 tries to unstake to early', async function () {
          await expect(this.user1SQRStaking.unstake(seedData.userStakeId1_0)).revertedWith(
            errorMessage.tooEarlyToWithdraw,
          );
        });

        it('user1 tries to unstake when contract has no company rewards', async function () {
          const increaseTo = addSeedSeconds(chainTime, contractConfig.duration);
          await time.increaseTo(increaseTo);
          await expect(this.user1SQRStaking.unstake(seedData.userStakeId1_0)).revertedWith(
            errorMessage.contractHasNoTokensFoUnstake,
          );
        });

        describe('company sent reward to contract', () => {
          beforeEach(async function () {
            await this.owner2ERC20Token.transfer(this.sqrStakingAddress, seedData.companyRewards);
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.owner2SQRStaking.getBalance()).eq(
              seedData.stake1 + seedData.companyRewards,
            );
          });

          it('user1 fetch calculatation reward for claiming', async function () {
            const increaseTo = addSeedSeconds(chainTime, caseSettings.claimDuration);
            await time.increaseTo(increaseTo);
            const currentReward1 = calculateReward(
              seedData.stake1,
              calculateAprInNumber(contractConfig.apr),
              caseSettings.claimDuration,
            );

            const claimReward = await this.user1SQRStaking.calculateCurrentRewardForUser(
              this.user1Address,
              seedData.userStakeId1_0,
            );

            expect(claimReward).closeTo(currentReward1, seedData.tokenMicroDelta);
          });

          it('user1 tries to claim non-existent stake', async function () {
            await expect(this.user1SQRStaking.claim(seedData.stakeIdNonExistent)).revertedWith(
              errorMessage.stakeDataIsntFound,
            );
          });

          it('user1 is allowed to claim (check event)', async function () {
            const increaseTo = addSeedSeconds(chainTime, caseSettings.claimDuration);
            await time.increaseTo(increaseTo);

            const currentReward1 = calculateReward(
              seedData.stake1,
              calculateAprInNumber(contractConfig.apr),
              caseSettings.claimDuration,
            );

            const receipt = await waitTx(this.user1SQRStaking.claim(seedData.userStakeId1_0));
            const eventLog = findEvent<ClaimEventArgs>(receipt);

            expect(eventLog).not.undefined;
            const [user, userStakeId, claimAmount] = eventLog?.args;
            expect(user).eq(this.user1Address);
            expect(userStakeId).eq(0);
            expect(claimAmount).closeTo(currentReward1, seedData.tokenMicroDelta);
          });

          describe('user1 claimed tokens', () => {
            beforeEach(async function () {
              const increaseTo = addSeedSeconds(chainTime, caseSettings.claimDuration);
              await time.increaseTo(increaseTo);
              await this.user1SQRStaking.claim(seedData.userStakeId1_0);
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              const currentReward1 = calculateReward(
                seedData.stake1,
                calculateAprInNumber(contractConfig.apr),
                caseSettings.claimDuration,
              );

              const maxReward1 = calculateReward(
                seedData.stake1,
                calculateAprInNumber(contractConfig.apr),
                contractConfig.duration,
              );

              expect(await this.owner2SQRStaking.getBalance()).closeTo(
                seedData.stake1 + seedData.companyRewards - currentReward1,
                seedData.tokenMicroDelta,
              );
              expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(1);
              expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.stake1);
              expect(await this.owner2SQRStaking.totalClaimed()).closeTo(
                currentReward1,
                seedData.tokenMicroDelta,
              );
              expect(await this.owner2SQRStaking.totalWithdrawn()).closeTo(
                currentReward1,
                seedData.tokenMicroDelta,
              );
              expect(await this.owner2SQRStaking.totalReservedReward()).closeTo(
                maxReward1 - currentReward1,
                seedData.tokenMicroDelta,
              );
              expect(
                await this.owner2SQRStaking.calculateMaxRewardForUser(
                  this.user1Address,
                  seedData.userStakeId1_0,
                ),
              ).closeTo(maxReward1, seedData.tokenMicroDelta);

              const stakes = await this.user1SQRStaking.fetchStakesForUser(this.user1Address);
              expect(stakes.length).eq(1);
              const stake = stakes[0];
              const { stakedAmount, claimedAmount, stakedAt, withdrawn } = stake;
              expect(stakedAmount).eq(seedData.stake1);
              expect(claimedAmount).closeTo(currentReward1, seedData.tokenMicroDelta);
              expect(stakedAt).closeTo(seedData.now, seedData.timeDelta);
              expect(withdrawn).eq(false);
            });

            it('user1 is allowed to unstake (check event)', async function () {
              const increaseTo = addSeedSeconds(chainTime, contractConfig.duration);
              await time.increaseTo(increaseTo);

              const receipt = await waitTx(this.user1SQRStaking.unstake(seedData.userStakeId1_0));
              const eventLog = findEvent<UnstakeEventArgs>(receipt);

              const currentReward1 = calculateReward(
                seedData.stake1,
                calculateAprInNumber(contractConfig.apr),
                contractConfig.duration - caseSettings.claimDuration,
              );

              expect(eventLog).not.undefined;
              const [user, userStakeId, unstakeAmount] = eventLog?.args;
              expect(user).eq(this.user1Address);
              expect(userStakeId).eq(0);
              expect(unstakeAmount).closeTo(
                seedData.stake1 + currentReward1,
                seedData.tokenMicroDelta,
              );
            });

            describe('increased time after contract duration', () => {
              beforeEach(async function () {
                const increaseTo = addSeedSeconds(chainTime, contractConfig.duration);
                await time.increaseTo(increaseTo);
              });

              it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {});

              it('user claimed several times', async function () {
                let diff = await getContractBalanceDiff(this, async () => {
                  await this.user1SQRStaking.claim(seedData.userStakeId1_0);
                });

                const currentReward1 = calculateReward(
                  seedData.stake1,
                  calculateAprInNumber(contractConfig.apr),
                  contractConfig.duration - caseSettings.claimDuration,
                );

                expect(diff).closeTo(currentReward1, seedData.tokenMicroDelta);

                await time.increaseTo(addSeedSeconds(chainTime, 2 * contractConfig.duration));
                await expect(this.user1SQRStaking.claim(seedData.userStakeId1_0)).revertedWith(
                  errorMessage.youHaveNoReward,
                );

                diff = await getContractBalanceDiff(this, async () => {
                  await this.user1SQRStaking.unstake(seedData.userStakeId1_0);
                });
                expect(diff).eq(seedData.stake1);
              });

              describe('user1 unstaked tokens', () => {
                beforeEach(async function () {
                  await this.user1SQRStaking.unstake(seedData.userStakeId1_0);
                });

                it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  const maxReward1 = calculateReward(
                    seedData.stake1,
                    calculateAprInNumber(contractConfig.apr),
                    contractConfig.duration,
                  );

                  expect(await this.owner2SQRStaking.getBalance()).eq(
                    seedData.companyRewards - maxReward1,
                  );

                  expect(await this.owner2SQRStaking.calculateExcessReward()).eq(
                    seedData.companyRewards - maxReward1,
                  );

                  expect(await this.owner2SQRStaking.calculateRequiredReward()).eq(seedData.zero);

                  expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.zero);
                  expect(await this.owner2SQRStaking.totalClaimed()).closeTo(
                    maxReward1,
                    seedData.tokenMicroDelta,
                  );
                  expect(await this.owner2SQRStaking.totalWithdrawn()).closeTo(
                    seedData.stake1 + maxReward1,
                    seedData.tokenMicroDelta,
                  );
                  expect(await this.owner2SQRStaking.totalReservedReward()).closeTo(
                    maxReward1 - maxReward1,
                    seedData.tokenMicroDelta,
                  );
                });

                it('user1 tries to claim already withdrawn stake', async function () {
                  await expect(this.user1SQRStaking.claim(seedData.userStakeId1_0)).revertedWith(
                    errorMessage.alreadyWithdrawn,
                  );
                });

                it('user1 tries to unstake already withdrawn stake', async function () {
                  await expect(this.user1SQRStaking.unstake(seedData.userStakeId1_0)).revertedWith(
                    errorMessage.alreadyWithdrawn,
                  );
                });

                describe('user1 staked tokens again', () => {
                  beforeEach(async function () {
                    await this.user1SQRStaking.stake(seedData.stake1);
                  });

                  it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                    expect(await this.owner2SQRStaking.getStakeCount()).eq(2);
                    expect(await this.owner2SQRStaking.getStakerCount()).eq(1);

                    const maxReward1 = calculateReward(
                      seedData.stake1,
                      calculateAprInNumber(contractConfig.apr),
                      contractConfig.duration,
                    );

                    expect(
                      await this.owner2SQRStaking.calculateMaxRewardForUser(
                        this.user1Address,
                        seedData.userStakeId1_1,
                      ),
                    ).eq(maxReward1);

                    expect(await this.owner2SQRStaking.getBalance()).eq(
                      seedData.companyRewards - maxReward1 + seedData.stake1,
                    );
                    expect(await this.owner2SQRStaking.getStakeCountForUser(this.user1Address)).eq(
                      2,
                    );
                    expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.stake1);

                    const maxReward2 = calculateReward(
                      seedData.stake1,
                      calculateAprInNumber(contractConfig.apr),
                      contractConfig.duration,
                    );

                    expect(await this.owner2SQRStaking.calculateExcessReward()).eq(
                      seedData.companyRewards - maxReward1 - maxReward2,
                    );
                    expect(await this.owner2SQRStaking.calculateRequiredReward()).eq(seedData.zero);

                    expect(await this.owner2SQRStaking.totalReservedReward()).eq(maxReward1);

                    const stakes = await this.user1SQRStaking.fetchStakesForUser(this.user1Address);
                    expect(stakes.length).eq(2);
                    const secondStake = stakes[1];
                    const { stakedAmount, claimedAmount, stakedAt, withdrawn } = secondStake;
                    expect(stakedAmount).eq(seedData.stake1);
                    expect(claimedAmount).eq(seedData.zero);
                    expect(stakedAt).closeTo(
                      toUnixTime(addSeedSeconds(chainTime, contractConfig.duration)),
                      seedData.timeDelta,
                    );
                    expect(withdrawn).eq(false);
                  });

                  describe('user1 unstaked tokens again', () => {
                    beforeEach(async function () {
                      const increaseTo = addSeedSeconds(chainTime, contractConfig.duration * 3);
                      await time.increaseTo(increaseTo);
                      await this.user1SQRStaking.unstake(seedData.userStakeId1_1);
                    });

                    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                      const maxReward1 = calculateReward(
                        seedData.stake1,
                        calculateAprInNumber(contractConfig.apr),
                        contractConfig.duration,
                      );

                      const remains = seedData.companyRewards - BigInt(2) * maxReward1;

                      expect(await this.owner2SQRStaking.getBalance()).eq(remains);
                      expect(await this.owner2SQRStaking.calculateExcessReward()).eq(remains);

                      const stakes = await this.user1SQRStaking.fetchStakesForUser(
                        this.user1Address,
                      );
                      expect(stakes.length).eq(2);
                      const secondStake = stakes[1];
                      const { stakedAmount, claimedAmount, stakedAt, withdrawn } = secondStake;
                      expect(stakedAmount).eq(seedData.stake1);
                      expect(claimedAmount).eq(seedData.zero);
                      expect(stakedAt).closeTo(
                        toUnixTime(addSeedSeconds(chainTime, contractConfig.duration)),
                        seedData.timeDelta,
                      );
                      expect(withdrawn).eq(true);
                    });

                    describe('user2 staked tokens', () => {
                      beforeEach(async function () {
                        await this.user2SQRStaking.stake(seedData.stake2);
                      });

                      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                        expect(await this.owner2SQRStaking.getStakeCount()).eq(3);
                        expect(await this.owner2SQRStaking.getStakerCount()).eq(2);

                        const maxReward1 = calculateReward(
                          seedData.stake1,
                          calculateAprInNumber(contractConfig.apr),
                          contractConfig.duration,
                        );

                        expect(await this.owner2SQRStaking.getBalance()).eq(
                          seedData.companyRewards - BigInt(2) * maxReward1 + seedData.stake2,
                        );

                        expect(
                          await this.owner2SQRStaking.getStakeCountForUser(this.user1Address),
                        ).eq(2);
                        expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.stake2);

                        const maxReward2 = calculateReward(
                          seedData.stake2,
                          calculateAprInNumber(contractConfig.apr),
                          contractConfig.duration,
                        );

                        expect(
                          await this.owner2SQRStaking.calculateMaxRewardForUser(
                            this.user2Address,
                            seedData.userStakeId2_0,
                          ),
                        ).eq(maxReward2);

                        expect(await this.owner2SQRStaking.calculateExcessReward()).eq(
                          seedData.companyRewards - BigInt(2) * maxReward1 - maxReward2,
                        );
                        expect(await this.owner2SQRStaking.calculateRequiredReward()).eq(
                          seedData.zero,
                        );

                        expect(await this.owner2SQRStaking.totalReservedReward()).eq(maxReward2);

                        const stakes = await this.user1SQRStaking.fetchStakesForUser(
                          this.user2Address,
                        );
                        expect(stakes.length).eq(1);
                        const stake = stakes[0];
                        const { stakedAmount, claimedAmount, stakedAt, withdrawn } = stake;
                        expect(stakedAmount).eq(seedData.stake2);
                        expect(claimedAmount).eq(seedData.zero);
                        expect(stakedAt).closeTo(
                          toUnixTime(addSeedSeconds(chainTime, contractConfig.duration * 3)),
                          seedData.timeDelta,
                        );
                        expect(withdrawn).eq(false);
                      });

                      describe('user2 claimed tokens', () => {
                        beforeEach(async function () {
                          const increaseTo = addSeedSeconds(
                            chainTime,
                            contractConfig.duration * 3 + caseSettings.claimDuration,
                          );
                          await time.increaseTo(increaseTo);
                          await this.user2SQRStaking.claim(seedData.userStakeId2_0);
                        });

                        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                          const maxReward1 = calculateReward(
                            seedData.stake1,
                            calculateAprInNumber(contractConfig.apr),
                            contractConfig.duration,
                          );

                          const currentReward2 = calculateReward(
                            seedData.stake2,
                            calculateAprInNumber(contractConfig.apr),
                            caseSettings.claimDuration,
                          );

                          expect(await this.owner2SQRStaking.getBalance()).closeTo(
                            seedData.companyRewards -
                              BigInt(2) * maxReward1 +
                              seedData.stake2 -
                              currentReward2,
                            seedData.tokenMicroDelta,
                          );
                          expect(
                            await this.owner2SQRStaking.getStakeCountForUser(this.user2Address),
                          ).eq(1);
                          expect(await this.owner2SQRStaking.totalStaked()).eq(seedData.stake2);

                          const stakes = await this.user1SQRStaking.fetchStakesForUser(
                            this.user2Address,
                          );
                          expect(stakes.length).eq(1);
                          const stake = stakes[0];
                          const { stakedAmount, claimedAmount, stakedAt, withdrawn } = stake;
                          expect(stakedAmount).eq(seedData.stake2);
                          expect(claimedAmount).closeTo(currentReward2, seedData.tokenMicroDelta);
                          expect(stakedAt).closeTo(
                            toUnixTime(addSeedSeconds(chainTime, contractConfig.duration * 3)),
                            seedData.timeDelta,
                          );
                          expect(withdrawn).eq(false);
                        });

                        describe('user1 unstaked tokens', () => {
                          beforeEach(async function () {
                            const increaseTo = addSeedSeconds(
                              chainTime,
                              contractConfig.duration * 5,
                            );
                            await time.increaseTo(increaseTo);
                            await this.user2SQRStaking.unstake(seedData.userStakeId2_0);
                          });

                          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                            const maxReward1 = calculateReward(
                              seedData.stake1,
                              calculateAprInNumber(contractConfig.apr),
                              contractConfig.duration,
                            );

                            const maxReward2 = calculateReward(
                              seedData.stake2,
                              calculateAprInNumber(contractConfig.apr),
                              contractConfig.duration,
                            );

                            expect(await this.owner2SQRStaking.getBalance()).closeTo(
                              seedData.companyRewards - BigInt(2) * maxReward1 - maxReward2,
                              seedData.tokenMicroDelta,
                            );

                            expect(await this.owner2SQRStaking.calculateExcessReward()).eq(
                              seedData.companyRewards - BigInt(2) * maxReward1 - maxReward2,
                            );

                            expect(await this.owner2SQRStaking.calculateRequiredReward()).eq(
                              seedData.zero,
                            );

                            expect(await this.owner2SQRStaking.totalWithdrawn()).closeTo(
                              BigInt(2) * (seedData.stake1 + maxReward1) +
                                seedData.stake2 +
                                maxReward2,
                              seedData.tokenMicroDelta,
                            );
                          });

                          it('user1 tries to call withdrawExcessReward without permission', async function () {
                            await expect(this.user1SQRStaking.withdrawExcessReward()).revertedWith(
                              errorMessage.onlyOwner,
                            );
                          });

                          it('owner2 is allowed to withdrawExcessReward (check event)', async function () {
                            const excessReward =
                              await this.owner2SQRStaking.calculateExcessReward();

                            const receipt = await waitTx(
                              this.owner2SQRStaking.withdrawExcessReward(),
                            );

                            const eventLog = findEvent<WithdrawExcessRewardEventArgs>(receipt);
                            expect(eventLog).not.undefined;
                            const [user, amount] = eventLog?.args;
                            expect(user).eq(this.owner2Address);
                            expect(amount).eq(excessReward);
                          });

                          describe('owner2 withdrew excess reward', () => {
                            beforeEach(async function () {
                              await this.owner2SQRStaking.withdrawExcessReward();
                            });

                            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                              expect(await this.owner2SQRStaking.getBalance()).eq(seedData.zero);
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
