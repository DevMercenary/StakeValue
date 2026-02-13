async function main() {
	const taprootAddr = "bcrt1pzt72lrqnjxnk6kqeukkaqhj7mher26dkfwgc02mwejq2trp755gqlem22d";
	const baseUrl = "https://runes.staging.midl.xyz";
	const runeId = "186382:3";

	// Check rune balance
	console.log("=== Rune Balance ===");
	const balUrl = `${baseUrl}/addresses/${taprootAddr}/runes/balances/${runeId}`;
	console.log("GET", balUrl);
	let res = await fetch(balUrl);
	console.log("Status:", res.status);
	if (res.ok) console.log(await res.text());

	// Check all runes for address
	console.log("\n=== All Runes ===");
	const allUrl = `${baseUrl}/addresses/${taprootAddr}/runes/balances?include_info=true`;
	res = await fetch(allUrl);
	console.log("Status:", res.status);
	if (res.ok) console.log(await res.text());

	// Check rune UTXOs
	console.log("\n=== Rune UTXOs ===");
	const utxoUrl = `${baseUrl}/addresses/${taprootAddr}/runes/utxos/${runeId}`;
	res = await fetch(utxoUrl);
	console.log("Status:", res.status);
	if (res.ok) console.log(await res.text());
}

main().catch(console.error);
