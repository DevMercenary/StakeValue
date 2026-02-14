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
import { Gift, RefreshCw, Clock, Loader2 } from "lucide-react";
import { type Address, formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAfterTx } from "@/shared/utils/refreshAfterTx";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTimeWarp } from "@/components/motion/TimeWarpContext";

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
			toast.success("Claim rewards sent!");
			refreshAfterTx(queryClient, "Claim Rewards");
		} catch (e: any) {
			console.error("Claim error:", e);
			toast.error(`Failed to claim: ${e.message?.slice(0, 120)}`);
		}
	};

	/* ─── Time Warp override ─── */
	const { isWarping, getSimulatedRewards } = useTimeWarp();
	const simulatedRewardsNum = isWarping ? getSimulatedRewards() : 0;

	const hasRewards = isWarping
		? simulatedRewardsNum > 0
		: pendingRewards && pendingRewards > 0n;

	const rewardsFormatted = isWarping
		? simulatedRewardsNum < 1
			? simulatedRewardsNum.toFixed(6)
			: simulatedRewardsNum.toFixed(4)
		: pendingRewards
			? formatUnits(pendingRewards, decimals)
			: "0";

	return (
		<Card className={`border-border/50 transition-all ${hasRewards ? "ring-1 ring-green-500/15" : ""}`}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<Gift className={`h-4 w-4 ${hasRewards ? "text-green-400" : "text-primary"}`} />
					Rewards
					{hasRewards && (
						<span className="relative flex h-2 w-2 ml-1">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{hasRewards ? (
					<>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Pending rewards
							</span>
							<div className="flex items-center gap-2">
								<span className="font-medium font-mono text-green-400">
									{rewardsFormatted} {symbol}
								</span>
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7 text-muted-foreground hover:text-primary"
									onClick={() => refetch()}
									aria-label="Refresh rewards"
								>
									<RefreshCw
										className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
									/>
								</Button>
							</div>
						</div>
						<LazyMotion features={domAnimation}>
							<m.div whileTap={{ scale: 0.98 }}>
								<Button
									className="w-full bg-green-600 hover:bg-green-700 text-white"
									disabled={isPending || !evmAddress || isWarping}
									onClick={handleClaim}
								>
									{isWarping ? (
										"Simulation Mode"
									) : isPending ? (
										<><Loader2 className="h-4 w-4 animate-spin mr-2" />Claiming...</>
									) : (
										`Claim ${rewardsFormatted} ${symbol}`
									)}
								</Button>
							</m.div>
						</LazyMotion>
					</>
				) : (
					<div className="text-center py-4 space-y-2">
						<Clock className="h-5 w-5 mx-auto text-muted-foreground/40" />
						<p className="text-sm text-muted-foreground/60">
							Rewards accrue every block
						</p>
						<p className="text-xs text-muted-foreground/40">
							Check back soon
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
