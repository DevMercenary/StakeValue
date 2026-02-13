import hre from "hardhat";
import { etchRune, broadcastTransaction } from "@midl/core";

async function main() {
	await hre.midl.initialize();

	const config = hre.midl.config;

	// 10000 full tokens with 18 decimals
	const premine = BigInt("10000000000000000000000"); // 10000 * 10^18

	console.log("Etching new rune STAKEVAULT...");
	console.log("Premine:", premine.toString(), "base units (10000 tokens)");

	const etching = await etchRune(config, {
		name: "STAKEVAULT",
		symbol: "V",
		divisibility: 18,
		premine,
	});

	console.log("Broadcasting funding tx...");
	const fundingTxId = await broadcastTransaction(config, etching.fundingTx);
	console.log("Funding tx:", fundingTxId);

	console.log("Broadcasting etching tx...");
	const etchingTxId = await broadcastTransaction(config, etching.etchingTx);
	console.log("Etching tx:", etchingTxId);

	console.log("Broadcasting reveal tx...");
	const revealTxId = await broadcastTransaction(config, etching.revealTx);
	console.log("Reveal tx:", revealTxId);

	console.log("\nDone! Rune STAKEVAULT etched.");
	console.log("Reveal tx is the one that determines the rune ID (blockHeight:txIndex).");
}

main().catch(console.error);
