import {
  ClaimEvent,
  StakeEvent,
  UnstakeEvent,
  WithdrawExcessRewardEvent,
} from '~typechain-types/contracts/WEB3Staking';
import { ContextBase } from '~types';

export type Fixture<T> = () => Promise<T>;

export type FixtureFn = <T>(fixture: Fixture<T>) => Promise<T>;

declare module 'mocha' {
  export interface Context extends ContextBase {
    loadFixture: FixtureFn;
  }
}

export interface EventArgs<T> {
  args: T;
}

export type StakeEventArgs = StakeEvent.Event & EventArgs<[string, number, number]>;

export type ClaimEventArgs = ClaimEvent.Event & EventArgs<[string, number, number]>;

export type UnstakeEventArgs = UnstakeEvent.Event & EventArgs<[string, number, number]>;

export type WithdrawExcessRewardEventArgs = WithdrawExcessRewardEvent.Event &
  EventArgs<[string, number]>;
