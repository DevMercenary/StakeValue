"use client";

import { useState, useMemo } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CountUp, ImagineButton } from "@/components/motion";
import {
	type PeriodKey,
	TIME_PERIODS,
	calculateAllProjections,
} from "@/shared/utils/earnings";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Calculator, Coins, Clock } from "lucide-react";

interface EarningsCalculatorProps {
	initialAmount?: number;
	apyPercent?: number;
	/** Show "Imagine Your Profit" warp button (dashboard only) */
	showImagine?: boolean;
	/** Current pending rewards from contract (for warp snapshot) */
	currentRewards?: number;
}

export const EarningsCalculator = ({
	initialAmount = 100,
	apyPercent = 10,
	showImagine = false,
	currentRewards = 0,
}: EarningsCalculatorProps) => {
	const [amount, setAmount] = useState(initialAmount);
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("1m");

	const projections = useMemo(
		() => calculateAllProjections(amount, apyPercent),
		[amount, apyPercent],
	);

	const selectedProjection = projections[selectedPeriod];
	const selectedPeriodInfo = TIME_PERIODS.find(
		(p) => p.key === selectedPeriod,
	)!;
	const percentGain = amount > 0 ? (selectedProjection / amount) * 100 : 0;

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAmount(Number(e.target.value));
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = Number(e.target.value);
		if (!Number.isNaN(val) && val >= 0) {
			setAmount(Math.min(val, 100_000));
		}
	};

	return (
		<LazyMotion features={domAnimation}>
			<Card className="border-border/50 overflow-hidden">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<Calculator className="h-4 w-4 text-green-400" />
						Earnings Calculator
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					{/* Amount Input */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm text-muted-foreground flex items-center gap-1.5">
								<Coins className="h-3.5 w-3.5" />
								Stake Amount
							</label>
							<div className="flex items-center gap-1.5">
								<input
									type="number"
									value={amount || ""}
									onChange={handleInputChange}
									className="w-24 bg-transparent border border-border/50 rounded-lg px-3 py-1.5 text-right font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
									min={0}
									max={100000}
								/>
								<span className="text-xs text-muted-foreground font-medium">
									SV
								</span>
							</div>
						</div>

						{/* Custom Slider */}
						<div className="relative">
							<input
								type="range"
								min={0}
								max={10000}
								step={10}
								value={Math.min(amount, 10000)}
								onChange={handleSliderChange}
								className="earnings-slider w-full"
							/>
							<div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1 px-0.5">
								<span>0</span>
								<span>2,500</span>
								<span>5,000</span>
								<span>7,500</span>
								<span>10,000</span>
							</div>
						</div>
					</div>

					{/* Period Selector */}
					<div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
						{TIME_PERIODS.map((period) => (
							<button
								key={period.key}
								type="button"
								onClick={() =>
									setSelectedPeriod(period.key)
								}
								className={`relative flex-1 py-1.5 text-xs font-medium rounded-md transition-colors z-10 cursor-pointer ${
									selectedPeriod === period.key
										? "text-green-400"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{selectedPeriod === period.key && (
									<m.div
										layoutId="period-indicator"
										className="absolute inset-0 rounded-md bg-green-500/10 border border-green-500/20"
										transition={{
											type: "spring",
											stiffness: 400,
											damping: 30,
										}}
									/>
								)}
								<span className="relative z-10">
									{period.label}
								</span>
							</button>
						))}
					</div>

					{/* Summary */}
					<m.div
						className="text-center py-2"
						key={`${amount}-${selectedPeriod}`}
						initial={{ opacity: 0.5, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<div className="text-2xl font-bold font-mono text-green-400">
							{amount > 0 ? "+" : ""}
							<CountUp
								value={selectedProjection}
								decimals={
									selectedProjection < 1 ? 4 : 2
								}
								suffix=" SV"
								duration={0.8}
							/>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							projected earnings in{" "}
							{selectedPeriodInfo.fullLabel.toLowerCase()}
							{percentGain > 0 && (
								<span className="text-green-400/70 ml-1">
									(+{percentGain.toFixed(2)}%)
								</span>
							)}
						</p>
					</m.div>

						{/* Projection Bento Grid */}
					<div className="grid grid-cols-3 gap-2">
						{TIME_PERIODS.map((period, i) => {
							const reward = projections[period.key];
							const pctGain =
								amount > 0
									? (reward / amount) * 100
									: 0;
							const isSelected =
								selectedPeriod === period.key;

							return (
								<m.button
									key={period.key}
									type="button"
									onClick={() =>
										setSelectedPeriod(period.key)
									}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.3 + i * 0.06,
									}}
									whileHover={{ y: -2 }}
									className={`text-left p-3 rounded-xl border backdrop-blur-sm transition-colors cursor-pointer ${
										isSelected
											? "border-green-500/30 bg-green-500/5"
											: "border-border/30 bg-card/50 hover:border-border/50"
									}`}
								>
									<div className="flex items-center gap-1 mb-1.5">
										<Clock
											className={`h-3 w-3 ${
												isSelected
													? "text-green-400"
													: "text-muted-foreground/50"
											}`}
										/>
										<span
											className={`text-[10px] font-medium ${
												isSelected
													? "text-green-400"
													: "text-muted-foreground"
											}`}
										>
											{period.fullLabel}
										</span>
									</div>
									<div
										className={`text-sm font-bold font-mono ${
											isSelected
												? "text-green-400"
												: "text-foreground/80"
										}`}
									>
										+
										{reward < 0.01
											? reward.toFixed(6)
											: reward < 1
												? reward.toFixed(4)
												: reward.toFixed(2)}
									</div>
									<div className="text-[10px] text-muted-foreground/50 font-mono">
										+{pctGain.toFixed(2)}%
									</div>
								</m.button>
							);
						})}
					</div>

					{/* Imagine Your Profit — dashboard only */}
					{showImagine && (
						<m.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
						>
							<ImagineButton
								amount={amount}
								periodKey={selectedPeriod}
								currentRewards={currentRewards}
							/>
						</m.div>
					)}
				</CardContent>
			</Card>
		</LazyMotion>
	);
};
