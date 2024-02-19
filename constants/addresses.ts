import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const SQR_TOKEN_NAME = 'SQRToken';

export enum CONTRACT_LIST {
  SQR_STAKING = 'SQR_STAKING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_STAKING: {
    // bnb: "0xfb61661997197D592549deeC84A923d660BE8BcB", //My1
    // bnb: "0x0dd3B6f35dbdE7FA75445d6eBA157cf63E716a06", //My2
    // bnb: '0xE0e8c474ab4C4364f9Dfd2B9EBcd7d6c97Eac74E', //My3
    // bnb: '0x0403e5745cC4eA0aB09D9a2D7a4a9E8c4b285FE2', //My4 - first work
    // bnb: '0xD0BdE3d45a157c4Add2A2c14c5232E9ED946FC63', //My5
    // bnb: '0x0aA80472cE53492f8f1F65278C5241E5Bc6FD50B', //My6
    // bnb: '0xB1E65b6b030c45f3e085B90D111C582694A01dFC', //My7
    // bnb: '0x81F7a4f36592A669Ff450c3960353d7bFcB4D649', //My8
    bsc: '0xCE3B34160D2D2Dc391963D392AF2808df0ad6c44', //Main
    // bsc: '0x282f8613996343F25FE01f223AB34E6348a2260b', //Prod
  },
};
