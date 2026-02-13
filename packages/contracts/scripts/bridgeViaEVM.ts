import hre from "hardhat";
import { finalizeBTCTransaction, signIntention } from "@midl/executor";
import { SignMessageProtocol } from "@midl/core";
import { keccak256 } from "viem";

async function main() {
	console.log("1. Initializing MIDL...");
	await hre.midl.initialize();
	const config = hre.midl.config;
	const publicClient = hre.midl.publicClient;

	console.log("2. Adding RuneERC20 intention for 187982:3...");
	const intention = await hre.midl.addRuneERC20Intention("187982:3");
	console.log("   OK");

	console.log("3. Finalizing BTC transaction...");
	const btcTx = await finalizeBTCTransaction(config, [intention], publicClient);
	console.log("   BTC tx id:", btcTx.tx.id);

	console.log("4. Signing intention...");
	const signedTx = await signIntention(config, publicClient, intention, [intention], {
		txId: btcTx.tx.id,
		protocol: SignMessageProtocol.Bip322,
	});
	console.log("   OK");

	console.log("5. Sending via MIDL RPC...");
	await (publicClient as any).sendBTCTransactions({
		btcTransaction: btcTx.tx.hex,
		serializedTransactions: [signedTx],
	});
	console.log("   Sent!");

	// Skip waitForTransaction on BTC side — track EVM receipt instead
	const evmHash = keccak256(signedTx as `0x${string}`);
	console.log("6. Waiting for EVM receipt:", evmHash);

	const receipt = await publicClient.waitForTransactionReceipt({
		hash: evmHash,
		confirmations: 1,
		timeout: 120_000, // 2 min
	});
	console.log("   Status:", receipt.status);
	console.log("   Block:", receipt.blockNumber.toString());
	console.log("   Logs:", receipt.logs.length);

	console.log("\nDone! Rune 187982:3 mapped to ERC20 on EVM.");
}

main().catch(e => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
