import { ethers } from 'hardhat';
import { WEB3_STAKING_NAME } from '~constants';
import { ContractConfig, getContractArgs } from '~seeds';
import { WEB3Staking } from '~typechain-types/contracts/WEB3Staking';
import { WEB3Staking__factory } from '~typechain-types/factories/contracts/WEB3Staking__factory';
import { WEB3StakingContext, Users } from '~types';

export async function getWEB3StakingContext(
  users: Users,
  deployData?: string | ContractConfig,
): Promise<WEB3StakingContext> {
  const { owner, user1, user2, user3, owner2, company } = users;

  const web3StakingFactory = (await ethers.getContractFactory(
    WEB3_STAKING_NAME,
  )) as unknown as WEB3Staking__factory;
  const owner2Web3StakingFactory = (await ethers.getContractFactory(
    WEB3_STAKING_NAME,
    owner2,
  )) as unknown as WEB3Staking__factory;

  let ownerWEB3Staking: WEB3Staking;

  if (typeof deployData === 'string') {
    ownerWEB3Staking = web3StakingFactory.connect(owner).attach(deployData) as WEB3Staking;
  } else {
    ownerWEB3Staking = await web3StakingFactory
      .connect(owner)
      .deploy(...getContractArgs(deployData as ContractConfig));
  }

  const web3StakingAddress = await ownerWEB3Staking.getAddress();

  const user1WEB3Staking = ownerWEB3Staking.connect(user1);
  const user2WEB3Staking = ownerWEB3Staking.connect(user2);
  const user3WEB3Staking = ownerWEB3Staking.connect(user3);
  const owner2WEB3Staking = ownerWEB3Staking.connect(owner2);
  const companyWEB3Staking = ownerWEB3Staking.connect(company);

  return {
    web3StakingFactory,
    owner2Web3StakingFactory,
    web3StakingAddress,
    ownerWEB3Staking,
    user1WEB3Staking,
    user2WEB3Staking,
    user3WEB3Staking,
    owner2WEB3Staking,
    companyWEB3Staking,
  };
}
