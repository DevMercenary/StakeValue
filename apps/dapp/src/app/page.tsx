import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rewards, Stake, StakingInfo, Unstake } from "@/widgets";
import Link from "next/link";

export default function Home() {
	return (
		<div className="space-y-8">
			{/* Hero */}
			<section className="text-center space-y-3 py-4">
				<Badge
					variant="secondary"
					className="rounded-full px-3 py-1 text-xs border border-primary/20 bg-primary/5 text-primary"
				>
					Built on MIDL Network
				</Badge>
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Bitcoin Staking,{" "}
					<span className="text-gradient">Simplified</span>
				</h1>
				<p className="mx-auto max-w-lg text-muted-foreground">
					Stake your SV tokens and earn ~10% APY rewards.
					Powered by MIDL&apos;s Bitcoin-native EVM.
				</p>
			</section>

			{/* Main Content */}
			<div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
				<div className="space-y-6">
					<StakingInfo />
					<Rewards />
				</div>

				<Card className="glow-orange border-border/50">
					<CardHeader>
						<CardTitle className="text-base">Manage Stake</CardTitle>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="stake" className="space-y-4">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="stake">Stake</TabsTrigger>
								<TabsTrigger value="unstake">Unstake</TabsTrigger>
							</TabsList>
							<TabsContent value="stake" className="space-y-4">
								<Stake />
							</TabsContent>
							<TabsContent value="unstake" className="space-y-4">
								<Unstake />
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>

			{/* Footer */}
			<footer className="border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
				<div className="flex items-center justify-center gap-4">
					<Link
						href="https://blockscout.staging.midl.xyz"
						target="_blank"
						className="transition-colors hover:text-primary"
					>
						Block Explorer
					</Link>
					<span className="text-border">|</span>
					<Link
						href="https://mempool.staging.midl.xyz"
						target="_blank"
						className="transition-colors hover:text-primary"
					>
						Bitcoin Mempool
					</Link>
					<span className="text-border">|</span>
					<Link
						href="https://midl.xyz"
						target="_blank"
						className="transition-colors hover:text-primary"
					>
						MIDL Network
					</Link>
				</div>
				<p className="mt-3 text-muted-foreground/60">
					StakeVault MVP &mdash; MIDL Regtest
				</p>
			</footer>
		</div>
	);
}
