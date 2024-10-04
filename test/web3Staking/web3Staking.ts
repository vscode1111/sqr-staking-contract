import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { WEB3_STAKING_NAME } from '~constants';
import { shouldBehaveCorrectDeployment } from './web3Staking.behavior.deployment';
import { shouldBehaveCorrectFetching } from './web3Staking.behavior.fetching';
import { shouldBehaveCorrectFundingAprCalculationCase } from './web3Staking.behavior.funding.aprCalculationCase';
import { shouldBehaveCorrectFundingWithdrawExcessRewardCase } from './web3Staking.behavior.funding.caseWithdrawExcessReward';
import { shouldBehaveCorrectFundingDefaultCase } from './web3Staking.behavior.funding.defaultCase';
import { shouldBehaveCorrectFundingNonZeroAccountLimitCase } from './web3Staking.behavior.funding.nonZeroAccountLimitCase';
import { shouldBehaveCorrectFundingZeroAprCase } from './web3Staking.behavior.funding.zeroAprCase';

describe(WEB3_STAKING_NAME, function () {
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
