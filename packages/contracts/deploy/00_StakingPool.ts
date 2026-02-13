import type { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
	await hre.midl.initialize();
	await hre.midl.deploy("StakingPool");
	await hre.midl.execute();
}
