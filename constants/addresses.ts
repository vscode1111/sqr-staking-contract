import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const SQR_TOKEN_NAME = 'SQRToken';

export enum CONTRACT_LIST {
  SQR_STAKING = 'SQR_STAKING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_STAKING: {
    bsc: '0x3f1Ba41D0b48CdAfAABC5D87075aCbC6dCFe62A4', //Main
    // bsc: '', //Main
    // bsc: '', //Prod
  },
};
