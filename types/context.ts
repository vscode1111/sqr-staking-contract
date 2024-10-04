import { Signer } from 'ethers';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { WEB3Staking } from '~typechain-types/contracts/WEB3Staking';
import { WEB3Staking__factory } from '~typechain-types/factories/contracts/WEB3Staking__factory';

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

export interface WEB3StakingContext {
  web3StakingFactory: WEB3Staking__factory;
  owner2Web3StakingFactory: WEB3Staking__factory;
  web3StakingAddress: string;
  ownerWEB3Staking: WEB3Staking;
  user1WEB3Staking: WEB3Staking;
  user2WEB3Staking: WEB3Staking;
  user3WEB3Staking: WEB3Staking;
  owner2WEB3Staking: WEB3Staking;
  companyWEB3Staking: WEB3Staking;
}

export type ContextBase = Users & ERC20TokenContext & WEB3StakingContext;
