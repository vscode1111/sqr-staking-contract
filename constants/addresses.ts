import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const SQR_TOKEN_NAME = 'SQRToken';

export enum CONTRACT_LIST {
  SQR_STAKING = 'SQR_STAKING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_STAKING: {
    bsc: '0xfd4233288fe26addEa358a1161B28C5c7e1e29a7', //test
    // bsc: '', //Main
    // bsc: '', //Prod
  },
};
