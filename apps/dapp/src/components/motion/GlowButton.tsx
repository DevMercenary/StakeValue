"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps {
	children: ReactNode;
	variant?: "primary" | "outline" | "cyan";
	glowOnHover?: boolean;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
}

const variantStyles = {
	primary:
		"bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500/50",
	outline:
		"bg-transparent border-amber-500/20 text-amber-400 hover:bg-amber-500/10",
	cyan: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500/50",
};

const glowStyles = {
	primary: "hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]",
	outline: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
	cyan: "hover:shadow-[0_0_20px_rgba(74,158,255,0.3)]",
};

export const GlowButton = ({
	children,
	variant = "primary",
	glowOnHover = true,
	className,
	onClick,
	disabled,
	type = "button",
}: GlowButtonProps) => {
	return (
		<LazyMotion features={domAnimation}>
			<m.button
				type={type}
				onClick={onClick}
				disabled={disabled}
				whileHover={{ scale: 1.04 }}
				whileTap={{ scale: 0.97 }}
				transition={{ type: "spring", stiffness: 400, damping: 25 }}
				className={cn(
					"relative inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
					variantStyles[variant],
					glowOnHover && glowStyles[variant],
					className,
				)}
			>
				{children}
			</m.button>
		</LazyMotion>
	);
};
