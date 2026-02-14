"use client";

import { ScrollReveal } from "@/components/motion";
import { Wallet, ArrowDownToLine, TrendingUp } from "lucide-react";

const steps = [
	{
		icon: Wallet,
		title: "Connect Wallet",
		description:
			"Link your Bitcoin wallet via XVerse to get started on MIDL.",
		color: "text-amber-400",
		glow: "bg-amber-500/10 border-amber-500/20",
	},
	{
		icon: ArrowDownToLine,
		title: "Stake SV Tokens",
		description:
			"Deposit your StakeVault tokens into the staking pool contract.",
		color: "text-blue-400",
		glow: "bg-blue-500/10 border-blue-500/20",
	},
	{
		icon: TrendingUp,
		title: "Earn Rewards",
		description: "Accumulate ~10% APY rewards, claimable at any time.",
		color: "text-green-400",
		glow: "bg-green-500/10 border-green-500/20",
	},
];

export const HowItWorks = () => (
	<section className="py-12">
		<ScrollReveal>
			<h2 className="text-center text-2xl font-bold mb-2">
				How It <span className="text-gradient">Works</span>
			</h2>
			<p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
				Three simple steps to start earning on Bitcoin.
			</p>
		</ScrollReveal>
		<div className="grid gap-8 md:grid-cols-3">
			{steps.map((step, i) => (
				<ScrollReveal key={step.title} delay={i * 0.15}>
					<div className="relative flex flex-col items-center text-center p-6 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(247,147,26,0.06)]">
						<div className="absolute -top-3 left-4 text-xs font-mono text-muted-foreground/40">
							0{i + 1}
						</div>
						<div
							className={`rounded-xl border p-3 mb-4 ${step.glow}`}
						>
							<step.icon className={`h-6 w-6 ${step.color}`} />
						</div>
						<h3 className="font-semibold mb-2">{step.title}</h3>
						<p className="text-sm text-muted-foreground">
							{step.description}
						</p>
					</div>
				</ScrollReveal>
			))}
		</div>
	</section>
);
