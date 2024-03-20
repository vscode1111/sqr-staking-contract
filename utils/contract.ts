import { APR_DIVIDER, DAYS, YEAR_PERIOD } from '~constants';

export function calculateReward(amount: bigint, apr: number, duration: number): bigint {
  const floatResult = (duration / YEAR_PERIOD) * Number(amount.toString()) * apr;
  return BigInt(floatResult.toFixed());
}

export function calculateDurationInDays(duration: bigint | number): number {
  return Number(duration) / DAYS;
}

export function calculateDaysFromContract(duration: bigint): number {
  return Number(duration) / DAYS;
}

export function calculateAprFromContract(apr: bigint): number {
  return (Number(apr) * 100) / APR_DIVIDER;
}

export function calculateAprForContract(aprInPercent: number): number {
  const floatResult = (aprInPercent * APR_DIVIDER) / 100;
  return Number(floatResult.toFixed());
}

export function calculateAprInNumber(aprInPercent: number): number {
  return aprInPercent / APR_DIVIDER;
}
