"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	glowColor?: string;
}

const glowMap: Record<string, string> = {
	orange: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
	cyan: "hover:shadow-[0_0_30px_rgba(74,158,255,0.1)]",
	purple: "hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
};

export const AnimatedCard = ({
	children,
	className,
	delay = 0,
	glowColor = "orange",
}: AnimatedCardProps) => {
	return (
		<LazyMotion features={domAnimation}>
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay, ease: "easeOut" }}
				whileHover={{ y: -4, transition: { duration: 0.2 } }}
				className={cn(
					"transition-shadow duration-300",
					glowMap[glowColor] ?? glowMap.orange,
					className,
				)}
			>
				{children}
			</m.div>
		</LazyMotion>
	);
};
