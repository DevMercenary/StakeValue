"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import type { ChartDataPoint } from "@/shared/utils/earnings";

interface AnimatedAreaChartProps {
	data: ChartDataPoint[];
	height?: number;
	accentColor?: "green" | "blue" | "amber";
}

const ACCENT = {
	green: { stroke: "#22c55e", fill: "rgba(34,197,94,", glow: "rgba(34,197,94,0.5)" },
	blue: { stroke: "#4a9eff", fill: "rgba(74,158,255,", glow: "rgba(74,158,255,0.5)" },
	amber: { stroke: "#f7931a", fill: "rgba(247,147,26,", glow: "rgba(247,147,26,0.5)" },
};

const PAD = { top: 20, right: 16, bottom: 28, left: 56 };

export const AnimatedAreaChart = ({
	data,
	height = 200,
	accentColor = "green",
}: AnimatedAreaChartProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
	const [containerW, setContainerW] = useState(600);
	const colors = ACCENT[accentColor];

	const measuredRef = useCallback((node: HTMLDivElement | null) => {
		if (!node) return;
		containerRef.current = node;
		const obs = new ResizeObserver((entries) => {
			const w = entries[0]?.contentRect.width;
			if (w && w > 0) setContainerW(Math.round(w));
		});
		obs.observe(node);
		return () => obs.disconnect();
	}, []);

	const W = containerW;
	const H = height;
	const plotW = W - PAD.left - PAD.right;
	const plotH = H - PAD.top - PAD.bottom;

	const { linePath, areaPath, points, yTicks } = useMemo(() => {
		if (data.length < 2) {
			return { linePath: "", areaPath: "", points: [], yTicks: [] };
		}

		const minVal = Math.min(...data.map((d) => d.total));
		const maxVal = Math.max(...data.map((d) => d.total));
		const range = maxVal - minVal || 1;
		const padded = range * 0.1;

		const yMin = Math.max(0, minVal - padded);
		const yMax = maxVal + padded;
		const yRange = yMax - yMin;

		const pts = data.map((d, i) => ({
			x: PAD.left + (i / (data.length - 1)) * plotW,
			y: PAD.top + plotH - ((d.total - yMin) / yRange) * plotH,
			data: d,
			idx: i,
		}));

		// Smooth cubic bezier path
		let line = `M ${pts[0].x} ${pts[0].y}`;
		for (let i = 1; i < pts.length; i++) {
			const prev = pts[i - 1];
			const curr = pts[i];
			const cpx = (prev.x + curr.x) / 2;
			line += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
		}

		const lastPt = pts[pts.length - 1];
		const area =
			line +
			` L ${lastPt.x} ${PAD.top + plotH} L ${pts[0].x} ${PAD.top + plotH} Z`;

		// Y-axis ticks (3 ticks)
		const ticks = [0, 0.5, 1].map((frac) => ({
			value: yMin + frac * yRange,
			y: PAD.top + plotH - frac * plotH,
		}));

		return { linePath: line, areaPath: area, points: pts, yTicks: ticks };
	}, [data, plotW, plotH]);

	const gradientId = `areaGrad-${accentColor}`;
	const glowId = `lineGlow-${accentColor}`;

	return (
		<LazyMotion features={domAnimation}>
			<div ref={measuredRef} className="w-full" style={{ height: H }}>
				<svg
					viewBox={`0 0 ${W} ${H}`}
					width={W}
					height={H}
					className="overflow-visible"
				>
					<defs>
						<linearGradient
							id={gradientId}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="0%"
								stopColor={colors.stroke}
								stopOpacity={0.25}
							/>
							<stop
								offset="100%"
								stopColor={colors.stroke}
								stopOpacity={0}
							/>
						</linearGradient>
						<filter id={glowId}>
							<feGaussianBlur
								stdDeviation="3"
								result="blur"
							/>
							<feMerge>
								<feMergeNode in="blur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>

					{/* Grid lines */}
					{yTicks.map((tick, i) => (
						<m.line
							key={i}
							x1={PAD.left}
							y1={tick.y}
							x2={W - PAD.right}
							y2={tick.y}
							stroke="rgba(255,255,255,0.06)"
							strokeDasharray="4 4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 + i * 0.1 }}
						/>
					))}

					{/* Y-axis labels */}
					{yTicks.map((tick, i) => (
						<m.text
							key={`label-${i}`}
							x={PAD.left - 8}
							y={tick.y + 4}
							textAnchor="end"
							fill="rgba(255,255,255,0.3)"
							fontSize={10}
							fontFamily="monospace"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 + i * 0.1 }}
						>
							{tick.value.toFixed(tick.value < 10 ? 2 : 0)}
						</m.text>
					))}

					{/* X-axis labels */}
					{points.map((pt, i) => (
						<m.text
							key={`x-${i}`}
							x={pt.x}
							y={H - 4}
							textAnchor="middle"
							fill="rgba(255,255,255,0.3)"
							fontSize={10}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 + i * 0.05 }}
						>
							{pt.data.label}
						</m.text>
					))}

					{/* Area fill */}
					{areaPath && (
						<m.path
							d={areaPath}
							fill={`url(#${gradientId})`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						/>
					)}

					{/* Line */}
					{linePath && (
						<m.path
							d={linePath}
							fill="none"
							stroke={colors.stroke}
							strokeWidth={2.5}
							strokeLinecap="round"
							filter={`url(#${glowId})`}
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{
								duration: 1.2,
								ease: "easeOut",
								delay: 0.5,
							}}
						/>
					)}

					{/* Data points */}
					{points.map((pt, i) => (
						<m.g
							key={i}
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								delay: 0.7 + i * 0.08,
								type: "spring",
								stiffness: 300,
								damping: 15,
							}}
							style={{
								originX: `${pt.x}px`,
								originY: `${pt.y}px`,
							}}
							onMouseEnter={() => setHoveredIdx(i)}
							onMouseLeave={() => setHoveredIdx(null)}
							className="cursor-pointer"
						>
							{/* Glow ring */}
							<circle
								cx={pt.x}
								cy={pt.y}
								r={hoveredIdx === i ? 10 : 0}
								fill={`${colors.fill}0.15)`}
								style={{
									transition: "r 0.2s ease",
								}}
							/>
							{/* Dot */}
							<circle
								cx={pt.x}
								cy={pt.y}
								r={hoveredIdx === i ? 5 : 3.5}
								fill={colors.stroke}
								stroke="#0a0a0f"
								strokeWidth={2}
								style={{
									transition: "r 0.15s ease",
								}}
							/>
						</m.g>
					))}

					{/* Tooltip */}
					{hoveredIdx !== null && points[hoveredIdx] && (
						<m.g
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.15 }}
						>
							<rect
								x={points[hoveredIdx].x - 48}
								y={points[hoveredIdx].y - 38}
								width={96}
								height={26}
								rx={6}
								fill="rgba(13,13,20,0.9)"
								stroke={colors.stroke}
								strokeWidth={0.5}
							/>
							<text
								x={points[hoveredIdx].x}
								y={points[hoveredIdx].y - 21}
								textAnchor="middle"
								fill={colors.stroke}
								fontSize={11}
								fontFamily="monospace"
								fontWeight="bold"
							>
								+{points[hoveredIdx].data.rewards.toFixed(
									points[hoveredIdx].data.rewards < 1 ? 4 : 2,
								)}{" "}
								SV
							</text>
						</m.g>
					)}
				</svg>
			</div>
		</LazyMotion>
	);
};
