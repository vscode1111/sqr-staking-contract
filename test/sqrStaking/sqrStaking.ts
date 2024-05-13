import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SQR_STAKING_NAME } from '~constants';
import { shouldBehaveCorrectDeployment } from './sqrStaking.behavior.deployment';
import { shouldBehaveCorrectFetching } from './sqrStaking.behavior.fetching';
import { shouldBehaveCorrectFundingAprCalculationCase } from './sqrStaking.behavior.funding-apr-calculation-case';
import { shouldBehaveCorrectFundingWithdrawExcessRewardCase } from './sqrStaking.behavior.funding-case-withdraw-excess-reward';
import { shouldBehaveCorrectFundingDefaultCase } from './sqrStaking.behavior.funding-default-case';
import { shouldBehaveCorrectFundingZeroAprCase } from './sqrStaking.behavior.funding-zero-apr-case';

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
});
