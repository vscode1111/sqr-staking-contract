import dayjs from 'dayjs';
import { BigNumberish } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { toUnixTime, toWei } from '~common';
import { DeployNetworkKey } from '~types';
import { defaultNetwork } from '../hardhat.config';
import { ContractConfig, DeployContractArgs, DeployTokenArgs, TokenConfig } from './types';

const chainDecimals: Record<DeployNetworkKey, number> = {
  bsc: 8,
};

export const sqrDecimals = chainDecimals[defaultNetwork];

const isTest = true; //false - PROD!

if (!isTest) {
  throw 'Are you sure? It is PROD!';
}

const priceDiv = BigInt(10_000);
const userDiv = BigInt(2);

export const prodContractConfig: Partial<ContractConfig> = {
  newOwner: '0xA8B8455ad9a1FAb1d4a3B69eD30A52fBA82549Bb', //Matan
  sqrToken: '0x2B72867c32CF673F7b02d208B26889fEd353B1f8', //SQR
  coldWallet: '0x79734Db10D301C257093E594A8A245D384E22c68', //Andrey MultiSig
  balanceLimit: toWei(25_000, sqrDecimals),
};

export const testContractConfig: Partial<ContractConfig> = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //My owner2
  sqrToken: '0x4072b57e9B3dA8eEB9F8998b69C868E9a1698E54', //tSQR
  coldWallet: '0x21D73A5dF25DAB8AcB73E782f71678c3b00A198F', //My coldWallet
  balanceLimit: toWei(1000, sqrDecimals) / priceDiv,
};

const extContractConfig = isTest ? testContractConfig : prodContractConfig;

export const contractConfig: ContractConfig = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
  sqrToken: '0x4072b57e9B3dA8eEB9F8998b69C868E9a1698E54',
  coldWallet: '0x21D73A5dF25DAB8AcB73E782f71678c3b00A198F',
  balanceLimit: toWei(1000, sqrDecimals),
  ...extContractConfig,
};

export function getContractArgs(
  newOwner: string,
  sqrToken: string,
  coldWallet: string,
  balanceLimit: BigNumberish,
): DeployContractArgs {
  return [newOwner, sqrToken, coldWallet, balanceLimit];
}

export const tokenConfig: TokenConfig = {
  name: 'empty',
  symbol: 'empty',
  newOwner: '0x81aFFCB2FaCEcCaE727Fa4b1B2ef534a1Da67791',
  initMint: toWei(1_000_000_000, sqrDecimals),
  decimals: sqrDecimals,
};

export function getTokenArgs(newOnwer: string): DeployTokenArgs {
  return [
    tokenConfig.name,
    tokenConfig.symbol,
    newOnwer,
    tokenConfig.initMint,
    tokenConfig.decimals,
  ];
}

const userInitBalance = toWei(10_000, sqrDecimals);
const deposit1 = toWei(100, sqrDecimals) / priceDiv;
const withdraw1 = toWei(30, sqrDecimals) / priceDiv;
const extraWithdraw1 = toWei(3000, sqrDecimals) / priceDiv;
const remains1 = deposit1 - withdraw1;
const extraDeposit1 = toWei(2500, sqrDecimals) / priceDiv;
const owner2Withdraw = toWei(300, sqrDecimals) / priceDiv;

const now1 = dayjs();

const userId1 = uuidv4();
const userId2 = uuidv4();

const depositTransationId1 = uuidv4();
const depositTransationId2 = uuidv4();
const withdrawTransationId1 = uuidv4();
const withdrawTransationId2 = uuidv4();

export const seedData = {
  zero: toWei(0),
  userInitBalance,
  totalAccountBalance: tokenConfig.initMint,
  deposit1,
  withdraw1,
  remains1,
  deposit2: deposit1 / userDiv,
  withdraw2: withdraw1 / userDiv,
  remains2: remains1 / userDiv,
  deposit3: deposit1 / userDiv / userDiv,
  withdraw3: withdraw1 / userDiv / userDiv,
  extraDeposit1,
  extraDeposit2: extraDeposit1 / userDiv,
  extraWithdraw1,
  extraWithdraw2: extraWithdraw1 / userDiv,
  owner2Withdraw,
  balanceLimit: toWei(100, sqrDecimals),
  allowance: toWei(1000000, sqrDecimals),
  now1: toUnixTime(now1.toDate()),
  balanceDelta: toWei(0.01, sqrDecimals),
  timeDelta: 500,
  wrongLockPeriod: 4,
  nowPlus1m: toUnixTime(now1.add(1, 'minute').toDate()),
  userId1,
  userId2,
  depositTransationId1,
  depositTransationId2,
  withdrawTransationId1,
  withdrawTransationId2,
};
