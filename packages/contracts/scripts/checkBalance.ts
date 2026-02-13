import { createPublicClient, http, formatUnits } from "viem";
import { midlRegtest } from "@midl/executor";

const ERC20_ABI = [
	{
		inputs: [{ name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

async function main() {
	const client = createPublicClient({
		chain: midlRegtest,
		transport: http(midlRegtest.rpcUrls.default.http[0]),
	});

	const evmAddress = "0x825c951219f96c17e962372788E1B5F673350a97";
	const deployAddress = "0x122bb2045dacEa782645852eaCe9503a65e0b1D0";
	const stakevault = "0x2112Ab69233fF97fab9cd7F2a45ab706D6D57f81";
	const runeERC20 = "0x46Aa052a0a42109D85b7c6f7Caff1836E1624Be6";
	const stakingPool = "0x0D46524CB2B78D67ae78e2621a872C794D38691A";

	for (const [label, addr] of [["User", evmAddress], ["Deploy", deployAddress]] as const) {
		console.log(`\n=== ${label}: ${addr} ===`);

		const balance = await client.getBalance({ address: addr as `0x${string}` });
		console.log("  Native BTC:", formatUnits(balance, 18));

		const svBalance = await client.readContract({
			address: stakevault as `0x${string}`,
			abi: ERC20_ABI,
			functionName: "balanceOf",
			args: [addr as `0x${string}`],
		});
		console.log("  STAKEVAULT (SV):", formatUnits(svBalance as bigint, 18));

		const runeBalance = await client.readContract({
			address: runeERC20 as `0x${string}`,
			abi: ERC20_ABI,
			functionName: "balanceOf",
			args: [addr as `0x${string}`],
		});
		console.log("  Rune ERC20:", formatUnits(runeBalance as bigint, 18));
	}

	// Check StakingPool total staked
	const STAKING_ABI = [
		{
			inputs: [{ name: "token", type: "address" }],
			name: "totalStaked",
			outputs: [{ name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
	] as const;

	console.log("\n=== StakingPool:", stakingPool, "===");
	try {
		const totalStakedSV = await client.readContract({
			address: stakingPool as `0x${string}`,
			abi: STAKING_ABI,
			functionName: "totalStaked",
			args: [stakevault as `0x${string}`],
		});
		console.log("  Total staked (SV):", formatUnits(totalStakedSV as bigint, 18));
	} catch (e: any) {
		console.log("  Total staked (SV): ERROR -", e.shortMessage || e.message);
	}
	try {
		const totalStakedRune = await client.readContract({
			address: stakingPool as `0x${string}`,
			abi: STAKING_ABI,
			functionName: "totalStaked",
			args: [runeERC20 as `0x${string}`],
		});
		console.log("  Total staked (Rune):", formatUnits(totalStakedRune as bigint, 18));
	} catch (e: any) {
		console.log("  Total staked (Rune): ERROR -", e.shortMessage || e.message);
	}
}

main().catch(console.error);
