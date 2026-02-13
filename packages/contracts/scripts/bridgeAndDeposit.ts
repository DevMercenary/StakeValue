import hre from "hardhat";

async function main() {
	await hre.midl.initialize();

	const runeId = "187982:3";
	const evmAddress = hre.midl.evm.address;

	// Step 1: Bridge rune to ERC20
	console.log("Step 1: Mapping rune to ERC20...");
	await hre.midl.addRuneERC20Intention(runeId);
	await hre.midl.execute();
	console.log("Rune mapped to ERC20!");

	// Step 2: Deposit 5000 tokens to EVM
	const amount = BigInt("5000000000000000000000"); // 5000 * 10^18
	console.log(`\nStep 2: Depositing 5000 STAKEVAULT to EVM address ${evmAddress}...`);

	await hre.midl.addTxIntention({
		deposit: {
			runes: [{ id: runeId, amount }],
		},
	});

	const result = await hre.midl.execute();
	console.log("Result:", JSON.stringify(result, null, 2));
	console.log("\nDone! 5000 STAKEVAULT deposited to EVM.");
}

main().catch(console.error);
