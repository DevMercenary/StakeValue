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

const schema = z.object({
	amount: z.coerce
		.number({ required_error: "Amount is required" })
		.positive()
		.finite(),
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
		formState: { isValid },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: "onChange",
		reValidateMode: "onChange",
	});

	const handleMax = () => {
		if (stakedBalance) {
			const maxVal = formatUnits(stakedBalance, decimals);
			reset({ amount: Number(maxVal) });
		}
	};

	const onSubmit = async (data: FormValues) => {
		try {
			const amount = parseUnits(String(data.amount), decimals);
			await unstake(tokenAddress, amount);
			toast.success("Unstake transaction submitted!");
			reset();
			queryClient.invalidateQueries();
		} catch (e: any) {
			console.error("Unstake error:", e);
			toast.error(`Failed to unstake: ${e.message?.slice(0, 120)}`);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Token</span>
					<span className="font-medium text-primary">{symbol}</span>
				</div>
				{stakedBalance !== undefined && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Staked</span>
						<button
							type="button"
							onClick={handleMax}
							className="font-mono text-xs hover:text-primary transition-colors cursor-pointer"
						>
							{formatUnits(stakedBalance, decimals)} {symbol}
							<span className="ml-1 text-primary/60">(MAX)</span>
						</button>
					</div>
				)}
			</div>
			<Input
				type="text"
				placeholder={`Amount to unstake (${symbol})`}
				className="font-mono"
				{...register("amount")}
			/>
			<Button
				type="submit"
				className="w-full"
				variant="outline"
				disabled={!isValid || !evmAddress || isPending}
			>
				{isPending ? "Unstaking..." : `Unstake ${symbol}`}
			</Button>
		</form>
	);
};
