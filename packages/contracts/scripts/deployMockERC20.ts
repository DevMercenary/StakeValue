import hre from "hardhat";

async function main() {
	await hre.midl.initialize();

	console.log("EVM address:", hre.midl.evm.address);

	// Check if already deployed
	const existing = await hre.midl.get("MockERC20");
	if (existing) {
		console.log("MockERC20 already deployed at:", existing.address);
		return;
	}

	// Deploy MockERC20 with constructor args: name, symbol, decimals, initialSupply
	// 10000 tokens with 18 decimals
	const initialSupply = BigInt("10000000000000000000000"); // 10000e18

	console.log("Deploying MockERC20 STAKEVAULT...");
	console.log("  Initial supply:", initialSupply.toString());

	const result = await hre.midl.deploy("MockERC20", [
		"STAKEVAULT",
		"SV",
		18,
		initialSupply,
	]);

	console.log("Contract will be at:", result.address);
	console.log("Executing transaction...");

	await hre.midl.execute();

	console.log("\n=== MockERC20 STAKEVAULT deployed! ===");
	console.log("Address:", result.address);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
