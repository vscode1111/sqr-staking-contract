import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import dayjs, { Dayjs } from 'dayjs';
import { TransactionReceipt } from 'ethers';
import { Context } from 'mocha';
import { toUnixTime } from '~common';
import { ContractConfig, seedData } from '~seeds';
import { ContextBase } from '~types';
import { loadFixture } from './loadFixture';
import { deployWEB3StakingContractFixture } from './web3Staking.fixture';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function getERC20TokenBalance(that: ContextBase, address: string) {
  return that.owner2ERC20Token.balanceOf(address);
}

export async function checkTotalWEB3Balance(that: ContextBase) {
  expect(
    await getTotalERC20Balance(that, [
      that.user1Address,
      that.user2Address,
      that.companyAddress,
      that.ownerAddress,
      that.owner2Address,
      that.erc20TokenAddress,
      that.web3StakingAddress,
    ]),
  ).eq(seedData.totalAccountBalance);
}

export async function getChainTime() {
  const chainTime = await time.latest();
  return dayjs(chainTime * 1000);
}

export async function loadWEB3StakingFixture(
  that: Context,
  contractConfig?: Partial<ContractConfig>,
  onNewSnapshot?: (
    chainTime: Dayjs,
    contractConfig?: Partial<ContractConfig | undefined>,
  ) => Promise<Partial<ContractConfig> | undefined>,
) {
  const fixture = await loadFixture(
    deployWEB3StakingContractFixture,
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

  await checkTotalWEB3Balance(that);
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
  const initContractBalance = await that.owner2WEB3Staking.getBalance();
  await fn();
  const contractBalance = await that.owner2WEB3Staking.getBalance();
  return initContractBalance - contractBalance;
}
