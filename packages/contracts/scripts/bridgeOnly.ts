import hre from "hardhat";

async function main() {
	console.log("Initializing MIDL...");
	await hre.midl.initialize();

	const runeId = "187982:3";

	console.log(`Adding RuneERC20 intention for ${runeId}...`);
	await hre.midl.addRuneERC20Intention(runeId);

	console.log("Executing...");
	const result = await hre.midl.execute();
	console.log("Result:", JSON.stringify(result, null, 2));

	console.log("Done! Rune mapped to ERC20.");
}

main().catch((e) => {
	console.error("Error:", e.message);
	process.exit(1);
});
