import hre from "hardhat";

async function main() {
	await hre.midl.initialize();

	const evmAddress = hre.midl.evm.address;
	// Try small amount first: 1 token = 1 * 10^18 base units
	const amount = BigInt("1000000000000000000");

	console.log("EVM address:", evmAddress);
	console.log("Transferring 1000 STAKEVALUETOKEN to EVM via deposit...");

	await hre.midl.addTxIntention({
		deposit: {
			runes: [
				{
					id: "186382:3",
					amount,
				},
			],
		},
	});

	console.log("Executing...");
	const result = await hre.midl.execute();
	console.log("Result:", JSON.stringify(result, null, 2));
	console.log("Done!");
}

main().catch(console.error);
