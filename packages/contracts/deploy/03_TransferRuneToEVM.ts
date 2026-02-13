import type { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
	await hre.midl.initialize();

	const evmAddress = hre.midl.evm.address;
	// amount in display units (not base units) — edict handles divisibility internally
	const amount = 1000;

	console.log("EVM address:", evmAddress);
	console.log("Transferring 1000 STAKEVALUETOKEN to EVM...");

	await hre.midl.addTxIntention({
		type: "edict",
		runeId: "186382:3",
		amount,
		receiver: evmAddress,
	});

	console.log("Executing intentions...");
	const result = await hre.midl.execute();
	console.log("Result:", JSON.stringify(result, null, 2));

	console.log("Rune transferred to EVM!");
}
