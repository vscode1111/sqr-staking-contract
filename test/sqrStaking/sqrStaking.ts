import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SQR_STAKING_NAME } from '~constants';
import { shouldBehaveCorrectDeployment } from './sqrStaking.behavior.deployment';
import { shouldBehaveCorrectFetching } from './sqrStaking.behavior.fetching';
import { shouldBehaveCorrectFundingAprCalculationCase } from './sqrStaking.behavior.funding.aprCalculationCase';
import { shouldBehaveCorrectFundingWithdrawExcessRewardCase } from './sqrStaking.behavior.funding.caseWithdrawExcessReward';
import { shouldBehaveCorrectFundingDefaultCase } from './sqrStaking.behavior.funding.defaultCase';
import { shouldBehaveCorrectFundingNonZeroAccountLimitCase } from './sqrStaking.behavior.funding.nonZeroAccountLimitCase';
import { shouldBehaveCorrectFundingZeroAprCase } from './sqrStaking.behavior.funding.zeroAprCase';

describe(SQR_STAKING_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  shouldBehaveCorrectDeployment();
  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFundingDefaultCase();
  shouldBehaveCorrectFundingAprCalculationCase();
  shouldBehaveCorrectFundingWithdrawExcessRewardCase();
  shouldBehaveCorrectFundingZeroAprCase();
  shouldBehaveCorrectFundingNonZeroAccountLimitCase();
});
