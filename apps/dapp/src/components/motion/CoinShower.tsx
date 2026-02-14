"use client";

import { useEffect, useState, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

interface FallingCoin {
	id: number;
	x: number;
	delay: number;
	duration: number;
	size: number;
	rotation: number;
	wobble: number;
}

interface CoinShowerProps {
	trigger: boolean;
	onComplete?: () => void;
	coinCount?: number;
}

let coinIdCounter = 0;

export const CoinShower = ({
	trigger,
	onComplete,
	coinCount = 24,
}: CoinShowerProps) => {
	const [coins, setCoins] = useState<FallingCoin[]>([]);

	const spawnCoins = useCallback(() => {
		const newCoins: FallingCoin[] = Array.from(
			{ length: coinCount },
			() => ({
				id: coinIdCounter++,
				x: Math.random() * 100,
				delay: Math.random() * 0.8,
				duration: Math.random() * 1.2 + 1.0,
				size: Math.random() * 16 + 14,
				rotation: Math.random() * 720 - 360,
				wobble: (Math.random() - 0.5) * 60,
			}),
		);
		setCoins(newCoins);

		const maxDuration = Math.max(...newCoins.map((c) => c.delay + c.duration));
		setTimeout(() => {
			setCoins([]);
			onComplete?.();
		}, (maxDuration + 0.3) * 1000);
	}, [coinCount, onComplete]);

	useEffect(() => {
		if (trigger) {
			spawnCoins();
		}
	}, [trigger, spawnCoins]);

	if (coins.length === 0) return null;

	return (
		<LazyMotion features={domAnimation}>
			<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
				<AnimatePresence>
					{coins.map((coin) => (
						<m.div
							key={coin.id}
							initial={{
								x: `${coin.x}vw`,
								y: "-40px",
								rotate: 0,
								opacity: 1,
								scale: 0.5,
							}}
							animate={{
								y: "110vh",
								rotate: coin.rotation,
								x: `calc(${coin.x}vw + ${coin.wobble}px)`,
								opacity: [1, 1, 1, 0.6, 0],
								scale: [0.5, 1, 1, 0.8],
							}}
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
										id={`coinGrad-${coin.id}`}
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
									fill={`url(#coinGrad-${coin.id})`}
									stroke="#a86310"
									strokeWidth="1.5"
								/>
								<circle
									cx="20"
									cy="20"
									r="14"
									fill="none"
									stroke="#cd7a14"
									strokeWidth="0.8"
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
			</div>
		</LazyMotion>
	);
};
