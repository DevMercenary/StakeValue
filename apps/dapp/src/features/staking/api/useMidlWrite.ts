"use client";

import {
	useAddTxIntention,
	useFinalizeBTCTransaction,
	useSignIntentions,
	useSendBTCTransactions,
} from "@midl/executor-react";
import { encodeFunctionData, type Abi } from "viem";
import { useState, useCallback } from "react";

type WriteContractParams = {
	abi: Abi;
	address: `0x${string}`;
	functionName: string;
	args?: unknown[];
};

export function useMidlWrite() {
	const { addTxIntentionAsync } = useAddTxIntention();
	const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
	const { signIntentionsAsync } = useSignIntentions();
	const { sendBTCTransactionsAsync } = useSendBTCTransactions();

	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const writeContract = useCallback(
		async (params: WriteContractParams) => {
			setIsPending(true);
			setError(null);
			try {
				const data = encodeFunctionData({
					abi: params.abi,
					functionName: params.functionName,
					args: params.args,
				});

				// 1. Add EVM call as intention
				await addTxIntentionAsync({
					intention: { evmTransaction: { to: params.address, data } },
					reset: true,
				});

				// 2. Finalize BTC transaction (wraps EVM calls)
				const finalized = await finalizeBTCTransactionAsync();

				// 3. Sign with BTC wallet (XVerse popup)
				const signed = await signIntentionsAsync({
					txId: finalized.tx.id,
				});

				// 4. Broadcast
				const hashes = await sendBTCTransactionsAsync({
					serializedTransactions: signed,
					btcTransaction: finalized.tx.hex,
				});

				setIsPending(false);
				return hashes;
			} catch (e) {
				setError(e as Error);
				setIsPending(false);
				throw e;
			}
		},
		[
			addTxIntentionAsync,
			finalizeBTCTransactionAsync,
			signIntentionsAsync,
			sendBTCTransactionsAsync,
		],
	);

	return { writeContract, isPending, error };
}
