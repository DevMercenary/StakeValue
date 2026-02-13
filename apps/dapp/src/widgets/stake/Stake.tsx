"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStake } from "@/features";
import {
	address,
	STAKEVAULT_ADDRESS,
	STAKEVAULT_DECIMALS,
	STAKEVAULT_SYMBOL,
} from "@/shared/contracts/StakingPool";
import { useEVMAddress } from "@midl/executor-react";
import { useMidlWrite } from "@/features/staking/api/useMidlWrite";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseUnits, formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const erc20ABI = [
	{
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

const schema = z.object({
	amount: z.coerce
		.number({ required_error: "Amount is required" })
		.positive()
		.finite(),
});

type FormValues = z.infer<typeof schema>;

export const Stake = () => {
	const evmAddress = useEVMAddress();
	const queryClient = useQueryClient();
	const { stake, isPending: isStaking } = useStake();
	const { writeContract: midlWrite, isPending: isApproving } = useMidlWrite();

	const tokenAddress = STAKEVAULT_ADDRESS;
	const decimals = STAKEVAULT_DECIMALS;
	const symbol = STAKEVAULT_SYMBOL;

	const { data: tokenBalance } = useReadContract({
		abi: erc20ABI,
		address: tokenAddress,
		functionName: "balanceOf",
		args: [evmAddress],
		query: { enabled: Boolean(evmAddress) },
	});

	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		abi: erc20ABI,
		address: tokenAddress,
		functionName: "allowance",
		args: [evmAddress, address],
		query: { enabled: Boolean(evmAddress) },
	});

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { isValid },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: "onChange",
		reValidateMode: "onChange",
	});

	const watchAmount = watch("amount");
	const parsedAmount =
		watchAmount && Number(watchAmount) > 0
			? parseUnits(String(watchAmount), decimals)
			: 0n;
	const needsApproval =
		parsedAmount > 0n && (allowance === undefined || allowance < parsedAmount);

	const handleApprove = async () => {
		try {
			await midlWrite({
				abi: erc20ABI,
				address: tokenAddress,
				functionName: "approve",
				args: [address, parsedAmount],
			});
			toast.success("Approval confirmed!");
			refetchAllowance();
			queryClient.invalidateQueries();
		} catch (err: any) {
			console.error("Approve error:", err);
			toast.error(`Approve failed: ${err.message?.slice(0, 120)}`);
		}
	};

	const onSubmit = async (data: FormValues) => {
		try {
			const amount = parseUnits(String(data.amount), decimals);
			await stake(tokenAddress, amount);
			toast.success("Stake transaction submitted!");
			reset();
			queryClient.invalidateQueries();
		} catch (e: any) {
			console.error("Stake error:", e);
			toast.error(`Failed to stake: ${e.message?.slice(0, 120)}`);
		}
	};

	const isPending = isStaking || isApproving;

	const handleMax = () => {
		if (tokenBalance) {
			const maxVal = formatUnits(tokenBalance, decimals);
			reset({ amount: Number(maxVal) });
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Token</span>
					<span className="font-medium text-primary">{symbol}</span>
				</div>
				{tokenBalance !== undefined && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Available</span>
						<button
							type="button"
							onClick={handleMax}
							className="font-mono text-xs hover:text-primary transition-colors cursor-pointer"
						>
							{formatUnits(tokenBalance, decimals)} {symbol}
							<span className="ml-1 text-primary/60">(MAX)</span>
						</button>
					</div>
				)}
			</div>
			<Input
				type="text"
				placeholder={`Amount to stake (${symbol})`}
				className="font-mono"
				{...register("amount")}
			/>
			{needsApproval ? (
				<Button
					type="button"
					className="w-full"
					variant="outline"
					disabled={!isValid || !evmAddress || isPending}
					onClick={handleApprove}
				>
					{isApproving ? "Approving..." : `1. Approve ${symbol}`}
				</Button>
			) : (
				<Button
					type="submit"
					className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
					disabled={!isValid || !evmAddress || isPending}
				>
					{isStaking ? "Staking..." : `Stake ${symbol}`}
				</Button>
			)}
		</form>
	);
};
