import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "@midl/hardhat-deploy";
import { MaestroSymphonyProvider, MempoolSpaceProvider } from "@midl/core";
import { midlRegtest } from "@midl/executor";
import { type HardhatUserConfig, vars } from "hardhat/config";

const mnemonic = vars.get("MNEMONIC");

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.28",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	defaultNetwork: "regtest",
	networks: {
		regtest: {
			url: midlRegtest.rpcUrls.default.http[0],
			accounts: {
				mnemonic,
				path: "m/86'/1'/0'/0/0",
			},
			chainId: midlRegtest.id,
		},
	},
	midl: {
		path: "deployments",
		networks: {
			regtest: {
				mnemonic,
				confirmationsRequired: 1,
				btcConfirmationsRequired: 1,
				hardhatNetwork: "regtest",
				network: {
					explorerUrl: "https://mempool.staging.midl.xyz",
					id: "regtest",
					network: "regtest",
				},
				providerFactory: () =>
					new MempoolSpaceProvider({
						regtest: "https://mempool.staging.midl.xyz",
					}),
				runesProviderFactory: () =>
					new MaestroSymphonyProvider({
						regtest: "https://runes.staging.midl.xyz",
					}),
			},
		},
	},
	etherscan: {
		apiKey: {
			regtest: "empty",
		},
		customChains: [
			{
				network: "regtest",
				chainId: midlRegtest.id,
				urls: {
					apiURL: "https://blockscout.staging.midl.xyz/api",
					browserURL: "https://blockscout.staging.midl.xyz",
				},
			},
		],
	},
};

export default config;
