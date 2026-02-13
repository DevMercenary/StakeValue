export const address = "0x0D46524CB2B78D67ae78e2621a872C794D38691A" as const;

/** Wrapped Bitcoin (WBTC) on MIDL Regtest */
export const WBTC_ADDRESS = "0x1736866b6CA02F2Ec69a4b7E6A70fd15700d71bE" as const;
export const WBTC_DECIMALS = 18;
export const WBTC_SYMBOL = "WBTC";

/** MockERC20 STAKEVAULT token on MIDL Regtest */
export const STAKEVAULT_ADDRESS = "0x2112Ab69233fF97fab9cd7F2a45ab706D6D57f81" as const;
export const STAKEVAULT_DECIMALS = 18;
export const STAKEVAULT_SYMBOL = "SV";

export const abi = [
	{
		inputs: [
			{ internalType: "address", name: "token", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "stake",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "token", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "unstake",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "token", type: "address" }],
		name: "claimRewards",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "token", type: "address" },
			{ internalType: "address", name: "user", type: "address" },
		],
		name: "getStakedBalance",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "token", type: "address" },
			{ internalType: "address", name: "user", type: "address" },
		],
		name: "getPendingRewards",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "token", type: "address" },
			{ internalType: "address", name: "user", type: "address" },
		],
		name: "getStakeInfo",
		outputs: [
			{ internalType: "uint256", name: "amount", type: "uint256" },
			{ internalType: "uint256", name: "stakedAt", type: "uint256" },
			{ internalType: "uint256", name: "rewardsClaimed", type: "uint256" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "token", type: "address" }],
		name: "totalStaked",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "REWARD_RATE_PER_SECOND",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "token", type: "address" }],
		name: "rewardPoolBalance",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "user", type: "address" },
			{ indexed: true, internalType: "address", name: "token", type: "address" },
			{ indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "Staked",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "user", type: "address" },
			{ indexed: true, internalType: "address", name: "token", type: "address" },
			{ indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "Unstaked",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "user", type: "address" },
			{ indexed: true, internalType: "address", name: "token", type: "address" },
			{ indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "RewardsClaimed",
		type: "event",
	},
] as const;
