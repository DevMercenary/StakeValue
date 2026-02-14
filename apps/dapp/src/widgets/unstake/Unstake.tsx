"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUnstake } from "@/features";
import {
	abi,
	address,
	STAKEVAULT_ADDRESS,
	STAKEVAULT_DECIMALS,
	STAKEVAULT_SYMBOL,
} from "@/shared/contracts/StakingPool";
import { useEVMAddress } from "@midl/executor-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseUnits, formatUnits, type Address } from "viem";
import { useReadContract } from "wagmi";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAfterTx } from "@/shared/utils/refreshAfterTx";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Loader2, ArrowUpRight } from "lucide-react";

const schema = z.object({
	amount: z.coerce
		.number({ required_error: "Enter amount" })
		.positive("Amount must be greater than 0")
		.finite("Enter a valid number"),
});

type FormValues = z.infer<typeof schema>;

export const Unstake = () => {
	const evmAddress = useEVMAddress();
	const queryClient = useQueryClient();
	const { unstake, isPending } = useUnstake();

	const tokenAddress = STAKEVAULT_ADDRESS;
	const decimals = STAKEVAULT_DECIMALS;
	const symbol = STAKEVAULT_SYMBOL;

	const { data: stakedBalance } = useReadContract({
		abi,
		address,
		functionName: "getStakedBalance",
		args: [tokenAddress as Address, evmAddress],
		query: { enabled: Boolean(evmAddress) },
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { isValid, errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: "onChange",
		reValidateMode: "onChange",
	});

	const setPercent = (pct: number) => {
		if (stakedBalance) {
			const val = Number(formatUnits(stakedBalance, decimals)) * (pct / 100);
			setValue("amount", Number(val.toFixed(6)), { shouldValidate: true });
		}
	};

	const onSubmit = async (data: FormValues) => {
		try {
			const amount = parseUnits(String(data.amount), decimals);
			await unstake(tokenAddress, amount);
			toast.success("Unstake transaction sent!");
			reset();
			refreshAfterTx(queryClient, "Unstake");
		} catch (e: any) {
			console.error("Unstake error:", e);
			toast.error(`Failed to unstake: ${e.message?.slice(0, 120)}`);
		}
	};

	// Empty state — nothing staked
	if (!stakedBalance || stakedBalance === 0n) {
		return (
			<LazyMotion features={domAnimation}>
				<m.div
					className="text-center py-8 space-y-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-muted/50 border border-border/30">
						<ArrowUpRight className="h-5 w-5 text-muted-foreground/50" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">No staked tokens yet</p>
						<p className="text-xs text-muted-foreground/60 mt-1">
							Switch to Stake tab to begin earning rewards
						</p>
					</div>
				</m.div>
			</LazyMotion>
		);
	}

	return (
		<LazyMotion features={domAnimation}>
			<m.form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Token</span>
						<span className="font-medium text-primary">
							{symbol}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							Staked
						</span>
						<span className="font-mono text-xs">
							{formatUnits(stakedBalance, decimals)} {symbol}
						</span>
					</div>
				</div>

				{/* Amount input */}
				<div className="space-y-2">
					<Input
						type="text"
						inputMode="decimal"
						placeholder={`Amount to unstake (${symbol})`}
						className={`font-mono ${errors.amount ? "border-red-500/50 focus:border-red-500" : ""}`}
						{...register("amount")}
					/>
					{errors.amount && (
						<p className="text-xs text-red-400">{errors.amount.message}</p>
					)}

					{/* Quick percent buttons */}
					<div className="flex gap-1.5">
						{[25, 50, 75, 100].map((pct) => (
							<button
								key={pct}
								type="button"
								onClick={() => setPercent(pct)}
								className="flex-1 py-1 text-[11px] font-medium rounded-md border border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
							>
								{pct === 100 ? "MAX" : `${pct}%`}
							</button>
						))}
					</div>
				</div>

				<m.div whileTap={{ scale: 0.98 }}>
					<Button
						type="submit"
						className="w-full"
						variant="outline"
						disabled={!isValid || !evmAddress || isPending}
					>
						{isPending ? (
							<><Loader2 className="h-4 w-4 animate-spin mr-2" />Unstaking...</>
						) : (
							`Unstake ${symbol}`
						)}
					</Button>
				</m.div>
			</m.form>
		</LazyMotion>
	);
};
