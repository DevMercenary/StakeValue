"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useClaimRewards } from "@/features";
import {
	abi,
	address,
	STAKEVAULT_ADDRESS,
	STAKEVAULT_DECIMALS,
	STAKEVAULT_SYMBOL,
} from "@/shared/contracts/StakingPool";
import { useEVMAddress } from "@midl/executor-react";
import { Gift, RefreshCw } from "lucide-react";
import { type Address, formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Rewards = () => {
	const evmAddress = useEVMAddress();
	const queryClient = useQueryClient();

	const tokenAddress = STAKEVAULT_ADDRESS;
	const decimals = STAKEVAULT_DECIMALS;
	const symbol = STAKEVAULT_SYMBOL;

	const {
		data: pendingRewards,
		refetch,
		isFetching,
	} = useReadContract({
		abi,
		address,
		functionName: "getPendingRewards",
		args: [tokenAddress as Address, evmAddress],
		query: {
			enabled: Boolean(evmAddress),
		},
	});

	const { claimRewards, isPending } = useClaimRewards();

	const handleClaim = async () => {
		try {
			await claimRewards(tokenAddress);
			toast.success("Rewards claimed!");
			queryClient.invalidateQueries();
		} catch (e: any) {
			console.error("Claim error:", e);
			toast.error(`Failed to claim: ${e.message?.slice(0, 120)}`);
		}
	};

	const hasRewards = pendingRewards && pendingRewards > 0n;

	return (
		<Card className="border-border/50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<Gift className="h-4 w-4 text-primary" />
					Rewards
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">
						Pending rewards
					</span>
					<div className="flex items-center gap-2">
						<span className="font-medium font-mono text-green-400">
							{pendingRewards
								? formatUnits(pendingRewards, decimals)
								: isFetching
									? ""
									: "0"}{" "}
							{symbol}
						</span>
						<Button
							size="icon"
							variant="ghost"
							className="h-7 w-7 text-muted-foreground hover:text-primary"
							onClick={() => refetch()}
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				</div>
				<Button
					className="w-full"
					variant="outline"
					disabled={!hasRewards || isPending || !evmAddress}
					onClick={handleClaim}
				>
					{isPending ? "Claiming..." : "Claim Rewards"}
				</Button>
			</CardContent>
		</Card>
	);
};
