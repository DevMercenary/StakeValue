"use client";

import { CountUp, ScrollReveal } from "@/components/motion";
import {
	abi,
	address,
	STAKEVAULT_ADDRESS,
	STAKEVAULT_DECIMALS,
} from "@/shared/contracts/StakingPool";
import { type Address, formatUnits } from "viem";
import { useReadContract } from "wagmi";

export const Stats = () => {
	const { data: totalStaked } = useReadContract({
		abi,
		address,
		functionName: "totalStaked",
		args: [STAKEVAULT_ADDRESS as Address],
	});

	const totalStakedNum = totalStaked
		? Number(formatUnits(totalStaked, STAKEVAULT_DECIMALS))
		: 0;

	return (
		<section className="py-10">
			<div className="neon-line mb-10" />
			<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
				<ScrollReveal delay={0}>
					<div className="space-y-1">
						<div className="text-2xl font-bold font-mono text-amber-400">
							<CountUp
								value={totalStakedNum}
								decimals={2}
								suffix=" SV"
							/>
						</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							Total Staked
						</div>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.1}>
					<div className="space-y-1">
						<div className="text-2xl font-bold font-mono text-green-400">
							<CountUp
								value={10}
								decimals={0}
								prefix="~"
								suffix="%"
							/>
						</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							APY Rate
						</div>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.2}>
					<div className="space-y-1">
						<div className="text-2xl font-bold font-mono text-blue-400">
							<CountUp value={1} decimals={0} />
						</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							Supported Tokens
						</div>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.3}>
					<div className="space-y-1">
						<div className="text-2xl font-bold font-mono text-violet-400">
							MIDL
						</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							Network
						</div>
					</div>
				</ScrollReveal>
			</div>
			<div className="neon-line mt-10" />
		</section>
	);
};
