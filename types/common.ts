export interface DeployNetworks {
  bsc: string;
}

export interface Addresses {
  sqrStakingAddress: string;
}

export type StringNumber = string | number;

export type DeployNetworkKey = keyof DeployNetworks;
