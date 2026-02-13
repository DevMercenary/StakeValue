import hre from "hardhat";
import { formatUnits, parseUnits } from "viem";

async function main() {
	await hre.midl.initialize();

	const evmAddress = hre.midl.evm.address;
	const mockERC20 = await hre.midl.get("MockERC20");
	const stakingPool = await hre.midl.get("StakingPool");

	if (!mockERC20 || !stakingPool) {
		throw new Error("Contracts not deployed!");
	}

	console.log("=== StakeValue Staking Flow Test ===\n");
	console.log("EVM Address:", evmAddress);
	console.log("MockERC20 (SV):", mockERC20.address);
	console.log("StakingPool:", stakingPool.address);

	// 1. Check initial balances
	console.log("\n--- Step 1: Check Initial Balances ---");
	const svBalance = await hre.midl.read("MockERC20", "balanceOf", [evmAddress]);
	console.log("SV Balance:", formatUnits(svBalance as bigint, 18));

	const stakedBefore = await hre.midl.read("StakingPool", "getStakedBalance", [
		mockERC20.address,
		evmAddress,
	]);
	console.log("Staked Balance:", formatUnits(stakedBefore as bigint, 18));

	const totalStakedBefore = await hre.midl.read("StakingPool", "totalStaked", [
		mockERC20.address,
	]);
	console.log("Total Staked:", formatUnits(totalStakedBefore as bigint, 18));

	// 2. Approve StakingPool to spend tokens
	const stakeAmount = parseUnits("100", 18); // 100 SV
	console.log("\n--- Step 2: Approve 100 SV for StakingPool ---");
	await hre.midl.write("MockERC20", "approve", [
		stakingPool.address,
		stakeAmount,
	]);
	await hre.midl.execute();
	console.log("Approved!");

	// 3. Stake tokens
	console.log("\n--- Step 3: Stake 100 SV ---");
	await hre.midl.write("StakingPool", "stake", [
		mockERC20.address,
		stakeAmount,
	]);
	await hre.midl.execute();
	console.log("Staked!");

	// 4. Check balances after staking
	console.log("\n--- Step 4: Verify Balances After Staking ---");
	const svBalanceAfter = await hre.midl.read("MockERC20", "balanceOf", [
		evmAddress,
	]);
	console.log("SV Balance:", formatUnits(svBalanceAfter as bigint, 18));

	const stakedAfter = await hre.midl.read("StakingPool", "getStakedBalance", [
		mockERC20.address,
		evmAddress,
	]);
	console.log("Staked Balance:", formatUnits(stakedAfter as bigint, 18));

	const totalStakedAfter = await hre.midl.read("StakingPool", "totalStaked", [
		mockERC20.address,
	]);
	console.log("Total Staked:", formatUnits(totalStakedAfter as bigint, 18));

	// 5. Check pending rewards
	console.log("\n--- Step 5: Check Pending Rewards ---");
	const rewards = await hre.midl.read("StakingPool", "getPendingRewards", [
		mockERC20.address,
		evmAddress,
	]);
	console.log(
		"Pending Rewards:",
		formatUnits(rewards as bigint, 18),
		"SV",
	);

	// 6. Get stake info
	console.log("\n--- Step 6: Stake Info ---");
	const info = await hre.midl.read("StakingPool", "getStakeInfo", [
		mockERC20.address,
		evmAddress,
	]);
	const [amount, stakedAt, rewardsClaimed] = info as [bigint, bigint, bigint];
	console.log("  Amount:", formatUnits(amount, 18));
	console.log("  Staked At:", new Date(Number(stakedAt) * 1000).toISOString());
	console.log("  Rewards Claimed:", formatUnits(rewardsClaimed, 18));

	// 7. Unstake half
	const unstakeAmount = parseUnits("50", 18);
	console.log("\n--- Step 7: Unstake 50 SV ---");
	await hre.midl.write("StakingPool", "unstake", [
		mockERC20.address,
		unstakeAmount,
	]);
	await hre.midl.execute();
	console.log("Unstaked!");

	// 8. Final balances
	console.log("\n--- Step 8: Final Balances ---");
	const svFinal = await hre.midl.read("MockERC20", "balanceOf", [evmAddress]);
	console.log("SV Balance:", formatUnits(svFinal as bigint, 18));

	const stakedFinal = await hre.midl.read("StakingPool", "getStakedBalance", [
		mockERC20.address,
		evmAddress,
	]);
	console.log("Staked Balance:", formatUnits(stakedFinal as bigint, 18));

	const totalFinal = await hre.midl.read("StakingPool", "totalStaked", [
		mockERC20.address,
	]);
	console.log("Total Staked:", formatUnits(totalFinal as bigint, 18));

	console.log("\n╔═══════════════════════════════════════╗");
	console.log("║  Staking flow test COMPLETED!         ║");
	console.log("║  approve → stake → unstake: SUCCESS   ║");
	console.log("╚═══════════════════════════════════════╝");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
