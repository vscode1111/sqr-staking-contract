export interface ContractConfig {
  newOwner: string;
  sqrToken: string;
  // coldWallet: string;
  // balanceLimit: bigint;
}

export type DeployContractArgs = [
  newOwner: string,
  sqrToken: string,
  // coldWallet: string,
  // balanceLimit: BigNumberish,
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
  Type91Days = 0,
  Type182Days = 1,
  Type365Days = 2,
  Type730Days = 4,
}
