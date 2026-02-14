"use client";

import { useEffect } from "react";
import {
	LazyMotion,
	domAnimation,
	m,
	useMotionValue,
	useTransform,
	animate,
} from "framer-motion";

interface CountUpProps {
	value: number;
	decimals?: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	className?: string;
}

export const CountUp = ({
	value,
	decimals = 0,
	duration = 1.5,
	prefix = "",
	suffix = "",
	className,
}: CountUpProps) => {
	const motionValue = useMotionValue(0);
	const display = useTransform(motionValue, (v) => {
		return `${prefix}${v.toFixed(decimals)}${suffix}`;
	});

	useEffect(() => {
		const controls = animate(motionValue, value, {
			duration,
			ease: "easeOut",
		});
		return () => controls.stop();
	}, [value, duration, motionValue]);

	return (
		<LazyMotion features={domAnimation}>
			<m.span className={className}>{display}</m.span>
		</LazyMotion>
	);
};
