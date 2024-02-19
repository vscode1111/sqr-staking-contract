import { Signer } from 'ethers';
import { SQRStaking } from '~typechain-types/contracts/SQRStaking';
import { SQRToken } from '~typechain-types/contracts/SQRToken';
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
  coldWallet: Signer;
  coldWalletAddress: string;
}

export interface SQRTokenContext {
  sqrTokenAddress: string;
  ownerSQRToken: SQRToken;
  user1SQRToken: SQRToken;
  user2SQRToken: SQRToken;
  user3SQRToken: SQRToken;
  owner2SQRToken: SQRToken;
  coldWalletSQRToken: SQRToken;
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
  coldWalletSQRStaking: SQRStaking;
}

export type ContextBase = Users & SQRTokenContext & SQRStakingContext;
