import hre from "hardhat";
import { finalizeBTCTransaction, signIntention } from "@midl/executor";
import { SignMessageProtocol, waitForTransaction } from "@midl/core";
import { keccak256 } from "viem";

async function main() {
	console.log("1. Initializing MIDL...");
	await hre.midl.initialize();
	const config = hre.midl.config;
	const publicClient = hre.midl.publicClient;

	console.log("2. Adding RuneERC20 intention...");
	const intention = await hre.midl.addRuneERC20Intention("187982:3");
	console.log("   Intention created OK");

	console.log("3. Finalizing BTC transaction...");
	const btcTx = await finalizeBTCTransaction(config, [intention], publicClient);
	console.log("   BTC tx id:", btcTx.tx.id);

	console.log("4. Signing intention...");
	const signedTx = await signIntention(config, publicClient, intention, [intention], {
		txId: btcTx.tx.id,
		protocol: SignMessageProtocol.Bip322,
	});
	console.log("   Signed OK");

	console.log("5. Sending transactions...");
	await (publicClient as any).sendBTCTransactions({
		btcTransaction: btcTx.tx.hex,
		serializedTransactions: [signedTx],
	});
	console.log("   Sent!");

	console.log("6. Waiting for BTC confirmation...");
	await waitForTransaction(config, btcTx.tx.id, 1);
	console.log("   BTC confirmed!");

	console.log("7. Waiting for EVM receipt...");
	const evmHash = keccak256(signedTx as `0x${string}`);
	const receipt = await publicClient.waitForTransactionReceipt({ hash: evmHash, confirmations: 1 });
	console.log("   EVM status:", receipt.status);

	console.log("Done!");
}

main().catch(e => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
