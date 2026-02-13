export function shortenAddress(address: `0x${string}`, chars = 4): string {
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatAPY(rate: number): string {
	return `${(rate * 100).toFixed(1)}%`;
}
