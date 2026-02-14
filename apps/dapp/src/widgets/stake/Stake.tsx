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
import { refreshAfterTx } from "@/shared/utils/refreshAfterTx";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Loader2, Check } from "lucide-react";

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
		.number({ required_error: "Enter amount" })
		.positive("Amount must be greater than 0")
		.finite("Enter a valid number"),
});

type FormValues = z.infer<typeof schema>;

export const Stake = ({
	onStakeSuccess,
}: { onStakeSuccess?: () => void } = {}) => {
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
		setValue,
		formState: { isValid, errors },
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
			toast.success("Approval sent!");
			refetchAllowance();
			refreshAfterTx(queryClient, "Approve");
		} catch (err: any) {
			console.error("Approve error:", err);
			toast.error(`Approve failed: ${err.message?.slice(0, 120)}`);
		}
	};

	const onSubmit = async (data: FormValues) => {
		try {
			const amount = parseUnits(String(data.amount), decimals);
			await stake(tokenAddress, amount);
			toast.success("Stake transaction sent!");
			reset();
			refreshAfterTx(queryClient, "Stake");
			onStakeSuccess?.();
		} catch (e: any) {
			console.error("Stake error:", e);
			toast.error(`Failed to stake: ${e.message?.slice(0, 120)}`);
		}
	};

	const isPending = isStaking || isApproving;

	const setPercent = (pct: number) => {
		if (tokenBalance) {
			const val = Number(formatUnits(tokenBalance, decimals)) * (pct / 100);
			setValue("amount", Number(val.toFixed(6)), { shouldValidate: true });
		}
	};

	return (
		<LazyMotion features={domAnimation}>
			<m.form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				{/* Balance info */}
				<div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Token</span>
						<span className="font-medium text-primary">
							{symbol}
						</span>
					</div>
					{tokenBalance !== undefined && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								Available
							</span>
							<span className="font-mono text-xs">
								{formatUnits(tokenBalance, decimals)} {symbol}
							</span>
						</div>
					)}
				</div>

				{/* Amount input */}
				<div className="space-y-2">
					<Input
						type="text"
						inputMode="decimal"
						placeholder={`Amount to stake (${symbol})`}
						className={`font-mono ${errors.amount ? "border-red-500/50 focus:border-red-500" : ""}`}
						{...register("amount")}
					/>
					{errors.amount && (
						<p className="text-xs text-red-400">{errors.amount.message}</p>
					)}

					{/* Quick percent buttons */}
					{tokenBalance !== undefined && tokenBalance > 0n && (
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
					)}
				</div>

				{/* Stepper: Approve → Stake */}
				{parsedAmount > 0n && (
					<m.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						className="flex items-center gap-2 text-xs px-1"
					>
						<div className={`flex items-center justify-center h-5 w-5 rounded-full border-2 transition-colors ${
							needsApproval
								? "border-amber-400 bg-amber-400/10 text-amber-400"
								: "border-green-400 bg-green-400/10 text-green-400"
						}`}>
							{needsApproval ? "1" : <Check className="h-3 w-3" />}
						</div>
						<span className={needsApproval ? "text-foreground" : "text-muted-foreground line-through"}>
							Approve
						</span>
						<div className="flex-1 h-px bg-border/50" />
						<div className={`flex items-center justify-center h-5 w-5 rounded-full border-2 transition-colors ${
							!needsApproval
								? "border-amber-400 bg-amber-400/10 text-amber-400"
								: "border-border/50 text-muted-foreground/50"
						}`}>
							2
						</div>
						<span className={!needsApproval ? "text-foreground" : "text-muted-foreground"}>
							Stake
						</span>
					</m.div>
				)}

				{/* Action button */}
				{needsApproval ? (
					<m.div whileTap={{ scale: 0.98 }}>
						<Button
							type="button"
							className="w-full"
							variant="outline"
							disabled={!isValid || !evmAddress || isPending}
							onClick={handleApprove}
						>
							{isApproving ? (
								<><Loader2 className="h-4 w-4 animate-spin mr-2" />Approving...</>
							) : (
								`Approve ${symbol}`
							)}
						</Button>
					</m.div>
				) : (
					<m.div whileTap={{ scale: 0.98 }}>
						<Button
							type="submit"
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={!isValid || !evmAddress || isPending}
						>
							{isStaking ? (
								<><Loader2 className="h-4 w-4 animate-spin mr-2" />Staking...</>
							) : (
								`Stake ${symbol}`
							)}
						</Button>
					</m.div>
				)}
			</m.form>
		</LazyMotion>
	);
};
