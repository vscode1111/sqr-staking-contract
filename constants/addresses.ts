import { DeployNetworks } from '~types';

export const SQR_STAKING_NAME = 'SQRStaking';
export const ERC20_TOKEN_NAME = 'ERC20Token';

export enum CONTRACT_LIST {
  ERC20_TOKEN = 'ERC20_TOKEN',
  SQR_STAKING = 'SQR_STAKING',
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  ERC20_TOKEN: {
    bsc: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
  },
  SQR_STAKING: {
    // bsc: '0x571C48cBd0EAD806386e3DbA0adB4E8C3De0A0A6', //test
    // bsc: '0xF28a353D1F72429d7559e207a044D03AeC61A63c', //test
    // bsc: '0xd9dFb1bE1860ed3615fc7E5EF8761B0D5FdA40bD', //test
    // bsc: '0x2B371b611a9AA92b0a3bceBF06d6B5A2ED9cF670', //test
    // bsc: '0xa3ad89386fa8cB28a2Fdf15863CC43e25D6D7163', //test
    // bsc: '0xa30ff68b68518f0493dbD5bB456a9564b3217D83', //test - 365000%
    // bsc: '0xd1CA8f6aBb2FAE5a35d62C2E9584e49e13fa001C', //test - 10%
    // bsc: '0xCE3fe2a3dae108626f7eDBB20b91E064EaE99a7B', //test2 - 10% - bad
    // bsc: '0xBBdDe273Ba2B25daA673230ccb60bc23Cb4C5cC1', //test2 - 10% - bad
    // bsc: '0xea13BF1B0B13D25dcbE5bE1156548681cD564962', //test2 - 10% - good
    // bsc: '0xAAF1D4f8A08B6699347DB18D96040C17100434c6', //test2 - 10% - good /max/min/limit
    // bsc: '0x33F52e8250451aFcD9de30aD38824a0684b7F63e', //test2 - 36500% - good /max/min/limit
    // bsc: '0x200Aff0A4B76BfC3937f8A27B5179f296875c5a1', //test2 - 10% - good
    // bsc: '0x15493330C416A50b99aB60406557F5226833fE76', //test2 - 10% - good
    // bsc: '0xd0B22433e90e6b96B78C8706BDCC97B80d368ef2', //test3 - 10% - 10 days
    // bsc: '0x5086F59846d156D8bAb083DEfdebC59F00e0c1F3', //test3 - 10% - 10 mins
    // bsc: '0x83966A040bF388429FB57d0775277f337F44eC64', //test3 - 10% - dur:10 mins - ded:30 mins

    // bsc: '0xAE04b794e2360501212c1d7E64da32895E7F1667', //main - 10% - 10 minutes
    // bsc: '0xB99CB43DaA871d818dc96b86606B1e5605aB3D5d', //main - 36500% - 1 day

    // minStakeAmount = 100 SQR
    // bsc: '0x135b578E30510Bf87f4e72D74f491c59fC5b7022', //prod - 10d - 10% - 20d
    // bsc: '0xf030DEDD371673bbb2B702A42b754DA440F69D5F', //prod - 30d - 12.5% - 60d
    // bsc: '0x70A268A6f267847Bf295f61A8f48f926E629eAD9', //prod - 60d - 13.75% - 120d
    // bsc: '0xdd2435D7ADfDCD446578aB969EC372E198259c71', //prod - 90d - 15% - 180d

    // minStakeAmount = 0 SQR
    // bsc: '0xC196B70a36A7B51BFD92120c3F8b9232204a491f', //prod - 10d - 10% - 20d
    // bsc: '0x8Dc66FB19469259f99Dbe3bc59bCa4132C62901a', //prod - 30d - 12.5% - 60d
    // bsc: '0xee2a61aF0718513bf5C5878E41164E7946A24256', //prod - 60d - 13.75% - 120d
    // bsc: '0xdD96B57B3a962C1682eb5bB84cDd854CA0632128', //prod - 90d - 15% - 180d
    // bsc: '0x44087D3Ea6c9E1430373a6c0C4bd9A6120D6A7c6', //prod - 30d - 12.5% - 60d
    // bsc: '0x4388A1aED92B557e791FeF9a1C651c63098252bc', //prod - 90d - 15% - 180d
    // bsc: '0x1aEabE4a8D4Fdc3cBa7c5eB35101e914A3551188', //prod - 10d - 10% - 365d
    
    //https://magic-square-ltd.slack.com/archives/C06HWPB5CMA/p1712761885753739
    // bsc: '0xd8491426BA3c3143A73Bb6Cb7aAe696dC9BbbC7C', //prod - 90 days / 14% / 1,000,000
    // bsc: '0x78edf1E40d47B042e1c73Da2ee98EAA6dBfec530', //prod - 180 days / 17.5% / 750,000
    bsc: '0x3e5d5396087868459f99C02cc3885A99C3067966', //prod - 180 days / 17.5% / 750,000
  },
};
