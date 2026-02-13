"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useEVMAddress } from "@midl/executor-react";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { type Address, formatUnits } from "viem";
import { useReadContract } from "wagmi";

export const StakingInfo = () => {
	const evmAddress = useEVMAddress();

	const tokenAddress = STAKEVAULT_ADDRESS;
	const decimals = STAKEVAULT_DECIMALS;
	const symbol = STAKEVAULT_SYMBOL;

	const {
		data: stakedBalance,
		refetch: refetchStaked,
		isFetching: isFetchingStaked,
	} = useReadContract({
		abi,
		address,
		functionName: "getStakedBalance",
		args: [tokenAddress as Address, evmAddress],
		query: {
			enabled: Boolean(evmAddress),
		},
	});

	const {
		data: totalStakedAmount,
		refetch: refetchTotal,
		isFetching: isFetchingTotal,
	} = useReadContract({
		abi,
		address,
		functionName: "totalStaked",
		args: [tokenAddress as Address],
	});

	const isFetching = isFetchingStaked || isFetchingTotal;

	const handleRefresh = () => {
		refetchStaked();
		refetchTotal();
	};

	return (
		<Card className="border-border/50">
			<CardHeader>
				<CardTitle className="text-base">Staking Pool</CardTitle>
				<CardDescription>
					Stake your {symbol} tokens and earn rewards on MIDL.
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
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">APY</span>
					<Badge
						variant="secondary"
						className="rounded-full border border-green-500/20 bg-green-500/10 text-green-400 apy-glow"
					>
						~10%
					</Badge>
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
				<div className="flex items-center justify-between">
					<span className="text-sm">Your staked balance</span>
					<div className="flex items-center gap-2">
						<span className="font-medium font-mono">
							{stakedBalance
								? formatUnits(stakedBalance, decimals)
								: isFetching
									? ""
									: "0"}{" "}
							{symbol}
						</span>
						<Button
							size="icon"
							variant="ghost"
							className="h-7 w-7 text-muted-foreground hover:text-primary"
							onClick={handleRefresh}
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
