import hre from "hardhat";

async function main() {
	await hre.midl.initialize();

	console.log("EVM address:", hre.midl.evm.address);

	// Check if already deployed
	const existing = await hre.midl.get("StakingPool");
	if (existing) {
		console.log("StakingPool already deployed at:", existing.address);
		return;
	}

	console.log("Deploying StakingPool...");

	const result = await hre.midl.deploy("StakingPool");
	console.log("Contract will be at:", result.address);
	console.log("Executing transaction...");

	await hre.midl.execute();

	console.log("\n=== StakingPool deployed! ===");
	console.log("Address:", result.address);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
