import { StakedEvent } from '~typechain-types/contracts/SQRStaking';
import { ContextBase } from '~types';

type Fixture<T> = () => Promise<T>;

declare module 'mocha' {
  export interface Context extends ContextBase {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}

export interface EventArgs<T> {
  args: T;
}

export type StakeEventArgs = StakedEvent.Event & EventArgs<[number, number, number, string]>;
