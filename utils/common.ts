import { Signer } from 'ethers';
import { signMessage } from '~common';

export async function signMessageForStake(
  signer: Signer,
  uid: string,
  txId: string,
  from: string,
  amount: bigint,
  to: string,
  timestampLimit: number,
) {
  return signMessage(
    signer,
    // userId,  transactionId,  from, amount, to,  timestampLimit
    ['string', 'string', 'address', 'uint256', 'address', 'uint32'],
    [uid, txId, from, amount, to, timestampLimit],
  );
}
