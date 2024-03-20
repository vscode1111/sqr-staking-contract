import { Signer } from 'ethers';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { SQRStaking } from '~typechain-types/contracts/SQRStaking';
import { SQRStaking__factory } from '~typechain-types/factories/contracts/SQRStaking__factory';

export interface Users {
  owner: Signer;
  ownerAddress: string;
  user1: Signer;
  user1Address: string;
  user2: Signer;
  user2Address: string;
  user3: Signer;
  user3Address: string;
  owner2: Signer;
  owner2Address: string;
  company: Signer;
  companyAddress: string;
}

export interface ERC20TokenContext {
  erc20TokenAddress: string;
  ownerERC20Token: ERC20Token;
  user1ERC20Token: ERC20Token;
  user2ERC20Token: ERC20Token;
  user3ERC20Token: ERC20Token;
  owner2ERC20Token: ERC20Token;
  companyERC20Token: ERC20Token;
}

export interface SQRStakingContext {
  sqrStakingFactory: SQRStaking__factory;
  owner2SqrStakingFactory: SQRStaking__factory;
  sqrStakingAddress: string;
  ownerSQRStaking: SQRStaking;
  user1SQRStaking: SQRStaking;
  user2SQRStaking: SQRStaking;
  user3SQRStaking: SQRStaking;
  owner2SQRStaking: SQRStaking;
  companySQRStaking: SQRStaking;
}

export type ContextBase = Users & ERC20TokenContext & SQRStakingContext;
