import hre from "hardhat";
import { formatUnits } from "viem";

async function main() {
	await hre.midl.initialize();

	const mockERC20 = await hre.midl.get("MockERC20");
	if (!mockERC20) {
		throw new Error("MockERC20 not deployed yet!");
	}

	const tokenAddress = mockERC20.address as `0x${string}`;
	const evmAddress = hre.midl.evm.address;
	const userAddress = "0x825c951219f96c17e962372788E1B5F673350a97" as const;

	console.log("MockERC20 address:", tokenAddress);
	console.log("Deployer EVM:", evmAddress);
	console.log("User EVM:", userAddress);

	// Check current balances
	const deployerBalance = await hre.midl.read("MockERC20", "balanceOf", [evmAddress]);
	const userBalance = await hre.midl.read("MockERC20", "balanceOf", [userAddress]);

	console.log("\nBefore transfer:");
	console.log("  Deployer balance:", formatUnits(deployerBalance as bigint, 18), "SV");
	console.log("  User balance:", formatUnits(userBalance as bigint, 18), "SV");

	// Transfer 5000 tokens to user
	const amount = BigInt("5000000000000000000000"); // 5000e18
	console.log("\nTransferring 5000 SV to user...");

	await hre.midl.write("MockERC20", "transfer", [userAddress, amount]);
	await hre.midl.execute();

	// Check updated balances
	const deployerBalanceAfter = await hre.midl.read("MockERC20", "balanceOf", [evmAddress]);
	const userBalanceAfter = await hre.midl.read("MockERC20", "balanceOf", [userAddress]);

	console.log("\nAfter transfer:");
	console.log("  Deployer balance:", formatUnits(deployerBalanceAfter as bigint, 18), "SV");
	console.log("  User balance:", formatUnits(userBalanceAfter as bigint, 18), "SV");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
