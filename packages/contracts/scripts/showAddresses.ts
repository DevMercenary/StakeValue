import hre from "hardhat";

async function main() {
	await hre.midl.initialize();

	const state = hre.midl.config.getState();
	console.log("Network:", state.network);
	console.log("EVM address:", hre.midl.evm.address);

	const accounts = state.accounts;
	for (const acc of accounts) {
		console.log("\nAccount:");
		console.log("  Address:", acc.address);
		console.log("  Type:", acc.type);
		console.log("  Public key:", acc.publicKey?.toString("hex") ?? "N/A");
	}

	// Try to get UTXOs
	const provider = state.provider;
	if (provider && accounts[0]) {
		try {
			const utxos = await provider.getUTXOs(accounts[0].address);
			console.log("\nUTXOs for", accounts[0].address, ":", utxos.length);
			for (const utxo of utxos) {
				console.log("  txid:", utxo.txid, "vout:", utxo.vout, "value:", utxo.value);
				if (utxo.runes?.length) {
					for (const r of utxo.runes) {
						console.log("    rune:", r.runeid, "amount:", r.amount.toString());
					}
				}
			}
		} catch (e: any) {
			console.log("Error getting UTXOs:", e.message);
		}
	}
}

main().catch(console.error);
