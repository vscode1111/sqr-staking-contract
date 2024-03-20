import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import dayjs, { Dayjs } from 'dayjs';
import { TransactionReceipt } from 'ethers';
import { Context } from 'mocha';
import { toUnixTime } from '~common';
import { ContractConfig, seedData } from '~seeds';
import { ContextBase } from '~types';
import { loadFixture } from './loadFixture';
import { deploySQRStakingContractFixture } from './sqrStaking.fixture';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function getERC20TokenBalance(that: ContextBase, address: string) {
  return that.owner2ERC20Token.balanceOf(address);
}

export async function checkTotalSQRBalance(that: ContextBase) {
  expect(
    await getTotalERC20Balance(that, [
      that.user1Address,
      that.user2Address,
      that.companyAddress,
      that.ownerAddress,
      that.owner2Address,
      that.erc20TokenAddress,
      that.sqrStakingAddress,
    ]),
  ).eq(seedData.totalAccountBalance);
}

export async function getChainTime() {
  const chainTime = await time.latest();
  return dayjs(chainTime * 1000);
}

export async function loadSQRStakingFixture(
  that: Context,
  contractConfig?: Partial<ContractConfig>,
  onNewSnapshot?: (
    chainTime: Dayjs,
    contractConfig?: Partial<ContractConfig | undefined>,
  ) => Promise<Partial<ContractConfig> | undefined>,
) {
  const fixture = await loadFixture(
    deploySQRStakingContractFixture,
    contractConfig,
    async (config) => {
      const chainTime = await getChainTime();
      const depositDeadline = toUnixTime(chainTime.add(100, 'days').toDate());
      const newConfig = await onNewSnapshot?.(chainTime, config);
      return {
        ...config,
        ...newConfig,
        depositDeadline,
      };
    },
  );

  for (const field in fixture) {
    that[field] = fixture[field as keyof ContextBase];
  }

  await checkTotalSQRBalance(that);
}

export async function getTotalERC20Balance(that: ContextBase, accounts: string[]): Promise<bigint> {
  const result = await Promise.all(accounts.map((address) => getERC20TokenBalance(that, address)));
  return result.reduce((acc, cur) => acc + cur, seedData.zero);
}

export function findEvent<T>(receipt: TransactionReceipt) {
  return receipt.logs.find((log: any) => log.fragment) as T;
}

export function addSeedSeconds(chainTime: Dayjs, seconds: number): Date {
  return chainTime.add(seconds + seedData.timeDelta, 'seconds').toDate();
}

export async function getContractBalanceDiff(that: Context, fn: () => Promise<void>) {
  const initContractBalance = await that.owner2SQRStaking.getBalance();
  await fn();
  const contractBalance = await that.owner2SQRStaking.getBalance();
  return initContractBalance - contractBalance;
}
