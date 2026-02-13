import type { HardhatRuntimeEnvironment } from "hardhat/types";

// Run with: npx hardhat run scripts/fundRewardPool.ts --network regtest

async function main() {
	const hre = require("hardhat") as HardhatRuntimeEnvironment;
	await hre.midl.initialize();

	const stakingPoolAddr = "0x0D46524CB2B78D67ae78e2621a872C794D38691A";
	const stakevaultAddr = "0x2112Ab69233fF97fab9cd7F2a45ab706D6D57f81";

	// Transfer 1000 SV tokens to StakingPool as reward pool
	const amount = BigInt("1000000000000000000000"); // 1000e18

	console.log("Transferring 1000 SV to StakingPool as reward pool...");
	console.log("  From:", hre.midl.evm.address);
	console.log("  To:", stakingPoolAddr);

	await hre.midl.write("MockERC20", "transfer", [stakingPoolAddr, amount]);
	await hre.midl.execute();

	console.log("Done! Reward pool funded with 1000 SV.");
}

main().catch(console.error);
