"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useTimeWarp } from "./TimeWarpContext";

/* ─── Falling coin type (same SVG as CoinShower) ─── */
interface RainCoin {
	id: number;
	x: number;
	delay: number;
	duration: number;
	size: number;
	rotation: number;
	wobble: number;
	spawnedAt: number;
}

let rainCoinId = 10_000;
const MAX_COINS = 50;
const SPAWN_INTERVAL = 500; // ms
const COINS_PER_WAVE = 6;

/* ─── Speed lines config ─── */
const SPEED_LINE_COUNT = 24;
const speedLines = Array.from({ length: SPEED_LINE_COUNT }, (_, i) => ({
	angle: (i / SPEED_LINE_COUNT) * 360,
	length: 150 + Math.random() * 350,
	opacity: 0.04 + Math.random() * 0.08,
	pulseDelay: Math.random() * 0.8,
	pulseDuration: 0.8 + Math.random() * 0.8,
}));

export const TimeWarpOverlay = () => {
	const { isWarping } = useTimeWarp();
	const [coins, setCoins] = useState<RainCoin[]>([]);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	/* ─── Continuous coin spawner ─── */
	const spawnWave = useCallback(() => {
		setCoins((prev) => {
			const now = performance.now();
			// Remove expired coins
			const alive = prev.filter(
				(c) => now - c.spawnedAt < (c.delay + c.duration) * 1000 + 500,
			);
			// Don't exceed max
			const slotsAvailable = MAX_COINS - alive.length;
			const count = Math.min(COINS_PER_WAVE, slotsAvailable);
			if (count <= 0) return alive;

			const wave: RainCoin[] = Array.from({ length: count }, () => ({
				id: rainCoinId++,
				x: Math.random() * 100,
				delay: Math.random() * 0.3,
				duration: 1.5 + Math.random() * 1.2,
				size: 12 + Math.random() * 14,
				rotation: Math.random() * 540 - 270,
				wobble: (Math.random() - 0.5) * 50,
				spawnedAt: now,
			}));

			return [...alive, ...wave];
		});
	}, []);

	useEffect(() => {
		if (isWarping) {
			spawnWave(); // Immediate first wave
			intervalRef.current = setInterval(spawnWave, SPAWN_INTERVAL);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			// Clear coins on exit (after a brief delay for exit animation)
			setTimeout(() => setCoins([]), 800);
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [isWarping, spawnWave]);

	return (
		<LazyMotion features={domAnimation}>
			<AnimatePresence>
				{isWarping && (
					<m.div
						key="time-warp-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.6 }}
						className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
					>
						{/* ─── Background tint ─── */}
						<div className="absolute inset-0 bg-gradient-radial from-blue-500/[0.04] via-violet-500/[0.02] to-transparent" />

						{/* ─── Speed lines from center ─── */}
						<div className="absolute inset-0 flex items-center justify-center">
							{speedLines.map((line, i) => (
								<m.div
									key={`speed-${i}`}
									className="absolute origin-center"
									style={{
										width: 1,
										height: line.length,
										rotate: `${line.angle}deg`,
										background: `linear-gradient(to top, transparent, rgba(74,158,255,${line.opacity}), transparent)`,
									}}
									animate={{
										opacity: [0.3, 1, 0.3],
										scaleY: [0.7, 1.3, 0.7],
									}}
									transition={{
										duration: line.pulseDuration,
										repeat: Number.POSITIVE_INFINITY,
										delay: line.pulseDelay,
										ease: "easeInOut",
									}}
								/>
							))}
						</div>

						{/* ─── Vignette edges ─── */}
						<div
							className="absolute inset-0"
							style={{
								background:
									"radial-gradient(ellipse at center, transparent 50%, rgba(6,6,20,0.4) 100%)",
							}}
						/>

						{/* ─── Continuous coin rain ─── */}
						<AnimatePresence>
							{coins.map((coin) => (
								<m.div
									key={coin.id}
									initial={{
										x: `${coin.x}vw`,
										y: "-30px",
										rotate: 0,
										opacity: 0.8,
										scale: 0.4,
									}}
									animate={{
										y: "110vh",
										rotate: coin.rotation,
										x: `calc(${coin.x}vw + ${coin.wobble}px)`,
										opacity: [0.8, 0.9, 0.9, 0.5, 0],
										scale: [0.4, 0.8, 0.8, 0.6],
									}}
									exit={{ opacity: 0 }}
									transition={{
										duration: coin.duration,
										delay: coin.delay,
										ease: [0.25, 0.46, 0.45, 0.94],
									}}
									className="absolute"
									style={{
										width: coin.size,
										height: coin.size,
									}}
								>
									<svg
										viewBox="0 0 40 40"
										width={coin.size}
										height={coin.size}
									>
										<defs>
											<radialGradient
												id={`warpCoin-${coin.id}`}
												cx="35%"
												cy="35%"
											>
												<stop
													offset="0%"
													stopColor="#ffd700"
												/>
												<stop
													offset="50%"
													stopColor="#f7931a"
												/>
												<stop
													offset="100%"
													stopColor="#cd7a14"
												/>
											</radialGradient>
										</defs>
										<circle
											cx="20"
											cy="20"
											r="18"
											fill={`url(#warpCoin-${coin.id})`}
											stroke="#a86310"
											strokeWidth="1.5"
										/>
										<text
											x="20"
											y="25"
											textAnchor="middle"
											fill="white"
											fontSize="14"
											fontWeight="bold"
											fontFamily="monospace"
										>
											₿
										</text>
										<ellipse
											cx="14"
											cy="13"
											rx="5"
											ry="3"
											fill="rgba(255,255,255,0.2)"
											transform="rotate(-20 14 13)"
										/>
									</svg>
								</m.div>
							))}
						</AnimatePresence>
					</m.div>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
};
