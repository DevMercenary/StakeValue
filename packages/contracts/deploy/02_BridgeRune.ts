import type { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
	await hre.midl.initialize();

	console.log("Adding Rune ERC20 intention for 187982:3...");
	await hre.midl.addRuneERC20Intention("187982:3");

	console.log("Executing intentions...");
	await hre.midl.execute();

	console.log("Rune bridged to EVM successfully!");
}
