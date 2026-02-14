"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { useTimeWarp } from "./TimeWarpContext";
import type { PeriodKey } from "@/shared/utils/earnings";

interface ImagineButtonProps {
	amount: number;
	periodKey: PeriodKey;
	currentRewards: number;
}

export const ImagineButton = ({
	amount,
	periodKey,
	currentRewards,
}: ImagineButtonProps) => {
	const { isWarping, startWarp } = useTimeWarp();

	const handleClick = () => {
		if (isWarping || amount <= 0) return;

		// Start the simulation
		startWarp(amount, periodKey, currentRewards);

		// Scroll to very top so HUD + overview cards are visible
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}, 100);
	};

	return (
		<LazyMotion features={domAnimation}>
			<m.button
				type="button"
				onClick={handleClick}
				disabled={amount <= 0 || isWarping}
				className="relative w-full group cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.97 }}
			>
				{/* Animated glow background */}
				<m.div
					className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 opacity-60 blur-md group-hover:opacity-90 transition-opacity"
					animate={{
						backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
					}}
					transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
					style={{ backgroundSize: "200% 200%" }}
				/>

				{/* Button face */}
				<div className="relative flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 text-white font-semibold text-sm border border-green-400/30">
					<m.div
						animate={{ rotate: [0, 15, -15, 0] }}
						transition={{
							duration: 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Sparkles className="h-4.5 w-4.5" />
					</m.div>

					<span>Imagine Your Profit</span>

					<m.div
						animate={{ x: [0, 3, 0] }}
						transition={{
							duration: 1.2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Zap className="h-4 w-4 text-amber-300" />
					</m.div>
				</div>
			</m.button>
		</LazyMotion>
	);
};
