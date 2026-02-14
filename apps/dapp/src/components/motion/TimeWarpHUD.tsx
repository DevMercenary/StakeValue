"use client";

import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { RotateCcw, Timer } from "lucide-react";
import { useTimeWarp } from "./TimeWarpContext";

function formatElapsed(seconds: number): string {
	const days = Math.floor(seconds / 86_400);
	const hours = Math.floor((seconds % 86_400) / 3_600);
	const minutes = Math.floor((seconds % 3_600) / 60);
	const secs = Math.floor(seconds % 60);

	if (days > 0) return `${days}d ${hours}h ${minutes}m`;
	if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
	if (minutes > 0) return `${minutes}m ${secs}s`;
	return `${secs}s`;
}

export const TimeWarpHUD = () => {
	const {
		isWarping,
		simulatedElapsed,
		targetSeconds,
		finished,
		stopWarp,
		getSimulatedRewards,
	} = useTimeWarp();

	const progress = targetSeconds > 0
		? Math.min(simulatedElapsed / targetSeconds, 1)
		: 0;

	const rewards = getSimulatedRewards();

	return (
		<LazyMotion features={domAnimation}>
			<AnimatePresence>
				{isWarping && (
					<m.div
						key="time-warp-hud"
						initial={{ y: -60, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -60, opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						className="fixed top-14 left-1/2 z-50 -translate-x-1/2"
					>
						<div className="flex flex-col items-center gap-2">
							{/* Main HUD pill */}
							<div className="flex items-center gap-3 rounded-2xl border border-blue-400/30 bg-background/85 backdrop-blur-xl px-5 py-3 shadow-[0_0_30px_rgba(74,158,255,0.15)]">
								{/* Pulsing dot */}
								<div className="relative flex h-2.5 w-2.5">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
								</div>

								{/* Timer icon spinning */}
								<m.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 3,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
								>
									<Timer className="h-4 w-4 text-blue-400" />
								</m.div>

								{/* Elapsed time */}
								<span
									className="text-sm font-mono font-semibold text-blue-400 min-w-[90px]"
									style={{
										textShadow:
											"0 0 12px rgba(74,158,255,0.6), 0 0 24px rgba(139,92,246,0.3)",
									}}
								>
									+{formatElapsed(simulatedElapsed)}
								</span>

								{/* Divider */}
								<div className="h-4 w-px bg-border/50" />

								{/* Rewards ticker */}
								<span className="text-sm font-mono font-bold text-green-400 tabular-nums min-w-[100px]">
									+{rewards < 1 ? rewards.toFixed(4) : rewards.toFixed(2)} SV
								</span>

								{/* Divider */}
								<div className="h-4 w-px bg-border/50" />

								{/* Back to Reality button */}
								<m.button
									onClick={stopWarp}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="flex items-center gap-1.5 rounded-lg bg-red-500/15 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
								>
									<RotateCcw className="h-3 w-3" />
									{finished ? "Done!" : "Back to Reality"}
								</m.button>
							</div>

							{/* Progress bar */}
							<div className="w-64 h-1 rounded-full bg-blue-500/10 overflow-hidden">
								<m.div
									className="h-full rounded-full bg-gradient-to-r from-blue-400 to-green-400"
									style={{ width: `${progress * 100}%` }}
									transition={{ duration: 0.1 }}
								/>
							</div>
						</div>
					</m.div>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
};
