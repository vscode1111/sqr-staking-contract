import { BigNumberish } from 'ethers/utils';

export interface ContractConfig {
  newOwner: string;
  sqrToken: string;
  coldWallet: string;
  balanceLimit: bigint;
}

export type DeployContractArgs = [
  newOwner: string,
  sqrToken: string,
  coldWallet: string,
  balanceLimit: BigNumberish,
];

export interface TokenConfig {
  name: string;
  symbol: string;
  newOwner: string;
  initMint: bigint;
  decimals: number;
}

export type DeployTokenArgs = [
  name_: string,
  symbol_: string,
  newOwner: string,
  initMint: bigint,
  decimals_: bigint | number,
];

export const enum StakingTypeID {
  Type30Days = 0,
  Type90Days = 1,
  Type180Days = 2,
  Type360Days = 3,
  Type720Days = 4,
  Type10Minutes = 5,
}
