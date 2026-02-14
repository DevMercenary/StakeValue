"use client";

import { useRef, useState, useCallback } from "react";
import { LazyMotion, domAnimation, m, useMotionValue, useTransform, useSpring } from "framer-motion";

interface InteractiveCoinProps {
	size?: number;
	className?: string;
}

export const InteractiveCoin = ({ size = 120, className }: InteractiveCoinProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isFlipping, setIsFlipping] = useState(false);

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), {
		stiffness: 150,
		damping: 20,
	});
	const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), {
		stiffness: 150,
		damping: 20,
	});

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isFlipping) return;
			const rect = e.currentTarget.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			mouseX.set((e.clientX - centerX) / (rect.width / 2));
			mouseY.set((e.clientY - centerY) / (rect.height / 2));
		},
		[mouseX, mouseY, isFlipping],
	);

	const handleMouseLeave = useCallback(() => {
		mouseX.set(0);
		mouseY.set(0);
	}, [mouseX, mouseY]);

	const handleClick = useCallback(() => {
		if (isFlipping) return;
		setIsFlipping(true);
		setTimeout(() => setIsFlipping(false), 1200);
	}, [isFlipping]);

	const half = size / 2;
	const innerR = size * 0.38;
	const outerR = size * 0.45;

	return (
		<LazyMotion features={domAnimation}>
			<div
				ref={containerRef}
				className={`relative cursor-pointer select-none ${className ?? ""}`}
				style={{
					width: size,
					height: size,
					perspective: 600,
				}}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
			>
				<m.div
					style={{
						width: size,
						height: size,
						rotateX: isFlipping ? undefined : rotateX,
						rotateY: isFlipping ? undefined : rotateY,
						transformStyle: "preserve-3d",
					}}
					animate={
						isFlipping
							? {
									rotateY: [0, 360 * 2],
									scale: [1, 1.15, 1],
								}
							: {}
					}
					transition={
						isFlipping
							? { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
							: undefined
					}
					whileHover={isFlipping ? undefined : { scale: 1.06 }}
				>
					<svg
						viewBox={`0 0 ${size} ${size}`}
						width={size}
						height={size}
						className="drop-shadow-[0_0_20px_rgba(247,147,26,0.4)]"
					>
						<defs>
							<radialGradient id="coinFace" cx="40%" cy="38%">
								<stop offset="0%" stopColor="#ffe066" />
								<stop offset="35%" stopColor="#f7931a" />
								<stop offset="85%" stopColor="#cd7a14" />
								<stop offset="100%" stopColor="#a86310" />
							</radialGradient>
							<radialGradient id="coinHighlight" cx="35%" cy="30%">
								<stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
								<stop offset="100%" stopColor="rgba(255,255,255,0)" />
							</radialGradient>
							<filter id="coinShadow">
								<feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
							</filter>
						</defs>

						{/* Outer ring shadow */}
						<circle
							cx={half}
							cy={half + 3}
							r={outerR}
							fill="rgba(0,0,0,0.3)"
						/>

						{/* Main coin body */}
						<circle
							cx={half}
							cy={half}
							r={outerR}
							fill="url(#coinFace)"
							stroke="#a86310"
							strokeWidth="2"
						/>

						{/* Inner ring */}
						<circle
							cx={half}
							cy={half}
							r={innerR}
							fill="none"
							stroke="#cd7a14"
							strokeWidth="1.5"
						/>

						{/* Decorative dots on rim */}
						{Array.from({ length: 24 }).map((_, i) => {
							const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
							const dotR = outerR - 3;
							const cx = Math.round((half + Math.cos(angle) * dotR) * 100) / 100;
							const cy = Math.round((half + Math.sin(angle) * dotR) * 100) / 100;
							return (
								<circle
									key={i}
									cx={cx}
									cy={cy}
									r={1}
									fill="#ffd700"
									opacity={0.5}
								/>
							);
						})}

						{/* BTC symbol */}
						<text
							x={half}
							y={half + size * 0.08}
							textAnchor="middle"
							fill="#fff"
							fontSize={size * 0.35}
							fontWeight="bold"
							fontFamily="monospace"
							filter="url(#coinShadow)"
						>
							₿
						</text>

						{/* Specular highlight */}
						<circle
							cx={half}
							cy={half}
							r={outerR}
							fill="url(#coinHighlight)"
						/>

						{/* Edge gleam */}
						<path
							d={`M ${half - outerR * 0.7} ${half - outerR * 0.3} A ${outerR} ${outerR} 0 0 1 ${half + outerR * 0.2} ${half - outerR * 0.85}`}
							fill="none"
							stroke="rgba(255,255,255,0.25)"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</m.div>

				{/* Glow ring on hover */}
				<m.div
					className="absolute inset-0 rounded-full"
					style={{
						boxShadow: "0 0 30px rgba(247,147,26,0.3), 0 0 60px rgba(247,147,26,0.1)",
					}}
					initial={{ opacity: 0 }}
					whileHover={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				/>
			</div>
		</LazyMotion>
	);
};
