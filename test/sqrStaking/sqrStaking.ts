import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SQR_STAKING_NAME } from '~constants';
import { ContextBase } from '~types';
import { shouldBehaveCorrectControl } from './sqrStaking.behavior.control';
import { shouldBehaveCorrectFetching } from './sqrStaking.behavior.fetching';
import { shouldBehaveCorrectFunding } from './sqrStaking.behavior.funding';
import { deploySQRStakingContractFixture } from './sqrStaking.fixture';

describe(SQR_STAKING_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const fixture = await this.loadFixture(deploySQRStakingContractFixture);
    for (const field in fixture) {
      this[field] = fixture[field as keyof ContextBase];
    }
  });

  shouldBehaveCorrectControl();
  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFunding();
});
