"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { shortenAddress } from "@/shared";
import {
	abi,
	address,
	STAKEVAULT_ADDRESS,
	STAKEVAULT_DECIMALS,
	STAKEVAULT_SYMBOL,
} from "@/shared/contracts/StakingPool";
import Link from "next/link";
import { type Address, formatUnits } from "viem";
import { useReadContract } from "wagmi";

export const StakingInfo = () => {
	const tokenAddress = STAKEVAULT_ADDRESS;
	const decimals = STAKEVAULT_DECIMALS;
	const symbol = STAKEVAULT_SYMBOL;

	const { data: totalStakedAmount } = useReadContract({
		abi,
		address,
		functionName: "totalStaked",
		args: [tokenAddress as Address],
	});

	return (
		<Card className="border-border/50">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Staking Pool</CardTitle>
				<CardDescription>
					Pool details and contract info.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Contract</span>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href={`https://blockscout.staging.midl.xyz/address/${address}`}
								className="text-sm font-medium text-primary hover:text-primary/80"
								target="_blank"
							>
								<code className="text-xs font-mono">
									{shortenAddress(address as `0x${string}`)}
								</code>
							</Link>
						</TooltipTrigger>
						<TooltipContent>{address as `0x${string}`}</TooltipContent>
					</Tooltip>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Token</span>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href={`https://blockscout.staging.midl.xyz/address/${tokenAddress}`}
								className="hover:opacity-80"
								target="_blank"
							>
								<Badge variant="secondary" className="rounded-full border border-primary/20 bg-primary/5 text-primary">
									{symbol}
								</Badge>
							</Link>
						</TooltipTrigger>
						<TooltipContent>{tokenAddress}</TooltipContent>
					</Tooltip>
				</div>
				<Separator className="bg-border/50" />
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Total staked</span>
					<span className="text-sm font-medium font-mono">
						{totalStakedAmount
							? formatUnits(totalStakedAmount, decimals)
							: "0"}{" "}
						{symbol}
					</span>
				</div>
			</CardContent>
		</Card>
	);
};
