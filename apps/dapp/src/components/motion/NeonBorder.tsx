"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NeonBorderProps {
	children: ReactNode;
	className?: string;
	color?: "orange" | "cyan" | "purple";
}

const borderColors = {
	orange: "from-amber-500/40 via-transparent to-amber-500/40",
	cyan: "from-blue-400/40 via-transparent to-blue-400/40",
	purple: "from-violet-500/40 via-transparent to-violet-500/40",
};

const glowColors = {
	orange: "shadow-[0_0_60px_rgba(245,158,11,0.06)]",
	cyan: "shadow-[0_0_60px_rgba(74,158,255,0.06)]",
	purple: "shadow-[0_0_60px_rgba(139,92,246,0.06)]",
};

export const NeonBorder = ({
	children,
	className,
	color = "orange",
}: NeonBorderProps) => {
	return (
		<LazyMotion features={domAnimation}>
			<m.div
				className={cn("relative rounded-xl p-[1px]", glowColors[color], className)}
				whileHover={{ scale: 1.005 }}
				transition={{ duration: 0.2 }}
			>
				<div
					className={cn(
						"absolute inset-0 rounded-xl bg-gradient-to-r opacity-60",
						borderColors[color],
					)}
				/>
				<div className="relative rounded-xl bg-card">{children}</div>
			</m.div>
		</LazyMotion>
	);
};
