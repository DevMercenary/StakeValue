import type { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
	await hre.midl.initialize();

	// Deploy MockERC20 with constructor args: name, symbol, decimals, initialSupply
	// 10000 tokens with 18 decimals = 10000 * 10^18
	const initialSupply = BigInt("10000000000000000000000"); // 10000e18

	await hre.midl.deploy("MockERC20", [
		"STAKEVAULT",
		"SV",
		18,
		initialSupply,
	]);

	await hre.midl.execute();
}
