"use client";

import { ScrollReveal } from "@/components/motion";
import { Shield, Zap, Globe, Lock } from "lucide-react";

const features = [
	{
		icon: Shield,
		title: "Bitcoin-Native Security",
		description:
			"Built on MIDL's Bitcoin-native EVM. Your assets are secured by Bitcoin's consensus.",
		accent: "text-amber-400",
	},
	{
		icon: Zap,
		title: "Instant Rewards",
		description:
			"Rewards accrue every second. Claim whenever you want with no lockup period.",
		accent: "text-blue-400",
	},
	{
		icon: Globe,
		title: "Decentralized",
		description:
			"Fully on-chain staking with transparent smart contracts and verifiable APY.",
		accent: "text-purple-400",
	},
	{
		icon: Lock,
		title: "Non-Custodial",
		description:
			"You maintain full control. Unstake at any time, no permission needed.",
		accent: "text-green-400",
	},
];

export const Features = () => (
	<section className="py-12">
		<ScrollReveal>
			<h2 className="text-center text-2xl font-bold mb-2">
				Why <span className="text-gradient">StakeVault</span>
			</h2>
			<p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
				Purpose-built for Bitcoin staking on the MIDL network.
			</p>
		</ScrollReveal>
		<div className="grid gap-6 md:grid-cols-2">
			{features.map((f, i) => (
				<ScrollReveal key={f.title} delay={i * 0.1}>
					<div className="group flex gap-4 p-5 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(247,147,26,0.06)]">
						<div className="mt-1">
							<f.icon className={`h-5 w-5 ${f.accent}`} />
						</div>
						<div>
							<h3 className="font-semibold mb-1">{f.title}</h3>
							<p className="text-sm text-muted-foreground">
								{f.description}
							</p>
						</div>
					</div>
				</ScrollReveal>
			))}
		</div>
	</section>
);
