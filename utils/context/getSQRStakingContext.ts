import { ethers } from 'hardhat';
import { SQR_STAKING_NAME } from '~constants';
import { ContractConfig, getContractArgs } from '~seeds';
import { SQRStaking } from '~typechain-types/contracts/SQRStaking';
import { SQRStaking__factory } from '~typechain-types/factories/contracts/SQRStaking__factory';
import { SQRStakingContext, Users } from '~types';

export async function getSQRStakingContext(
  users: Users,
  deployData?: string | ContractConfig,
): Promise<SQRStakingContext> {
  const { owner, user1, user2, user3, owner2, company } = users;

  const sqrStakingFactory = (await ethers.getContractFactory(
    SQR_STAKING_NAME,
  )) as unknown as SQRStaking__factory;
  const owner2SqrStakingFactory = (await ethers.getContractFactory(
    SQR_STAKING_NAME,
    owner2,
  )) as unknown as SQRStaking__factory;

  let ownerSQRStaking: SQRStaking;

  if (typeof deployData === 'string') {
    ownerSQRStaking = sqrStakingFactory.connect(owner).attach(deployData) as SQRStaking;
  } else {
    ownerSQRStaking = await sqrStakingFactory
      .connect(owner)
      .deploy(...getContractArgs(deployData as ContractConfig));
  }

  const sqrStakingAddress = await ownerSQRStaking.getAddress();

  const user1SQRStaking = ownerSQRStaking.connect(user1);
  const user2SQRStaking = ownerSQRStaking.connect(user2);
  const user3SQRStaking = ownerSQRStaking.connect(user3);
  const owner2SQRStaking = ownerSQRStaking.connect(owner2);
  const companySQRStaking = ownerSQRStaking.connect(company);

  return {
    sqrStakingFactory,
    owner2SqrStakingFactory,
    sqrStakingAddress,
    ownerSQRStaking,
    user1SQRStaking,
    user2SQRStaking,
    user3SQRStaking,
    owner2SQRStaking,
    companySQRStaking,
  };
}
