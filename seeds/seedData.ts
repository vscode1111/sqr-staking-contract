import dayjs from 'dayjs';
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
  // coldWallet: '0x79734Db10D301C257093E594A8A245D384E22c68', //Andrey MultiSig
  // balanceLimit: toWei(25_000, sqrDecimals),
};

export const testContractConfig: Partial<ContractConfig> = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //owner2
  sqrToken: '0x4072b57e9B3dA8eEB9F8998b69C868E9a1698E54', //tSQR
  // coldWallet: '0xAca11c3Dde62ACdffE8d9279fDc8AFDD945556A7', //My coldWallet
  // balanceLimit: toWei(1000, sqrDecimals) / priceDiv,
};

const extContractConfig = isTest ? testContractConfig : prodContractConfig;

export const contractConfig: ContractConfig = {
  newOwner: '0x81aFFCB2FaCEcCaE727Fa4b1B2ef534a1Da67791',
  sqrToken: '0x4072b57e9B3dA8eEB9F8998b69C868E9a1698E54',
  // coldWallet: '0x81aFFCB2FaCEcCaE727Fa4b1B2ef534a1Da67791',
  // balanceLimit: toWei(1000, sqrDecimals),
  ...extContractConfig,
};

export function getContractArgs(
  newOwner: string,
  sqrToken: string,
  // coldWallet: string,
  // balanceLimit: BigNumberish,
): DeployContractArgs {
  // return [newOwner, sqrToken, coldWallet, balanceLimit];
  return [newOwner, sqrToken];
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
const stake1 = toWei(100, sqrDecimals) / priceDiv;
const unstake = toWei(30, sqrDecimals) / priceDiv;
const extraUnstke1 = toWei(3000, sqrDecimals) / priceDiv;
const remains1 = stake1 - unstake;
const extraStake1 = toWei(2500, sqrDecimals) / priceDiv;
const owner2Unstake = toWei(300, sqrDecimals) / priceDiv;

const now1 = dayjs();

const userId1 = uuidv4();
const userId2 = uuidv4();

const skakeTransationId1 = uuidv4();
const skakeTransationId2 = uuidv4();
const unstakeTransationId1 = uuidv4();
const unstakeTransationId2 = uuidv4();

export const seedData = {
  zero: toWei(0),
  userInitBalance,
  totalAccountBalance: tokenConfig.initMint,
  stake1,
  withdraw1: unstake,
  remains1,
  stake2: stake1 / userDiv,
  unstake2: unstake / userDiv,
  remains2: remains1 / userDiv,
  stake3: stake1 / userDiv / userDiv,
  unstake3: unstake / userDiv / userDiv,
  extraStake1: extraStake1,
  extraStake2: extraStake1 / userDiv,
  extraWithdraw1: extraUnstke1,
  extraWithdraw2: extraUnstke1 / userDiv,
  owner2Withdraw: owner2Unstake,
  balanceLimit: toWei(100, sqrDecimals),
  allowance: toWei(1000000, sqrDecimals),
  now1: toUnixTime(now1.toDate()),
  balanceDelta: toWei(0.01, sqrDecimals),
  timeDelta: 500,
  wrongLockPeriod: 4,
  nowPlus1m: toUnixTime(now1.add(1, 'minute').toDate()),
  userId1,
  userId2,
  skakeTransationId1,
  skakeTransationId2,
  unstakeTransationId1,
  unstakeTransationId2,
};
