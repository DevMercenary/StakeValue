"use client";

import { useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Rewards,
	Stake,
	StakingInfo,
	Unstake,
	HowItWorks,
	Features,
	Stats,
	EarningsCalculator,
} from "@/widgets";
import {
	AnimatedCard,
	NeonBorder,
	GlowButton,
	ScrollReveal,
	CountUp,
	FloatingCoins,
	CoinShower,
	InteractiveCoin,
	TimeWarpProvider,
	useTimeWarp,
	TimeWarpOverlay,
	TimeWarpHUD,
} from "@/components/motion";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ConnectButton } from "@midl/satoshi-kit";
import {
	Shield,
	TrendingUp,
	Zap,
	Coins,
	Percent,
	Wallet,
	Gift,
	Calculator,
	ArrowRight,
	Sparkles,
} from "lucide-react";
import { useEVMAddress } from "@midl/executor-react";
import {
	abi,
	address as contractAddress,
	STAKEVAULT_ADDRESS,
	STAKEVAULT_DECIMALS,
} from "@/shared/contracts/StakingPool";
import { type Address, formatUnits } from "viem";
import { useReadContract } from "wagmi";

export default function Home() {
	return (
		<LazyMotion features={domAnimation}>
			<ConnectButton>
				{({ openConnectDialog, isConnected, isConnecting }) =>
					isConnected ? (
						<TimeWarpProvider>
							<Dashboard />
						</TimeWarpProvider>
					) : (
						<Landing
							openConnectDialog={openConnectDialog}
							isConnecting={isConnecting}
						/>
					)
				}
			</ConnectButton>
		</LazyMotion>
	);
}

/* ─── Dashboard (connected wallet) ─── */
function Dashboard() {
	const evmAddress = useEVMAddress();
	const [showCoinShower, setShowCoinShower] = useState(false);

	const handleStakeSuccess = useCallback(() => {
		setShowCoinShower(true);
	}, []);

	const { data: stakedBalance } = useReadContract({
		abi,
		address: contractAddress,
		functionName: "getStakedBalance",
		args: [STAKEVAULT_ADDRESS as Address, evmAddress],
		query: { enabled: Boolean(evmAddress) },
	});

	const { data: totalStaked } = useReadContract({
		abi,
		address: contractAddress,
		functionName: "totalStaked",
		args: [STAKEVAULT_ADDRESS as Address],
	});

	const { data: pendingRewards } = useReadContract({
		abi,
		address: contractAddress,
		functionName: "getPendingRewards",
		args: [STAKEVAULT_ADDRESS as Address, evmAddress],
		query: { enabled: Boolean(evmAddress) },
	});

	const stakedNum = stakedBalance
		? Number(formatUnits(stakedBalance, STAKEVAULT_DECIMALS))
		: 0;
	const totalNum = totalStaked
		? Number(formatUnits(totalStaked, STAKEVAULT_DECIMALS))
		: 0;
	const rewardsNum = pendingRewards
		? Number(formatUnits(pendingRewards, STAKEVAULT_DECIMALS))
		: 0;
	const sharePercent = totalNum > 0 ? (stakedNum / totalNum) * 100 : 0;
	const isNewUser = stakedNum === 0;

	/* ─── Time Warp integration ─── */
	const { isWarping, getSimulatedRewards } = useTimeWarp();
	const displayRewardsNum = isWarping ? getSimulatedRewards() : rewardsNum;

	const overviewCards = [
		{
			label: "Your Staked",
			value: stakedNum,
			suffix: " SV",
			decimals: 2,
			icon: Coins,
			color: "text-amber-400",
			border: "border-amber-500/15",
			bg: "bg-amber-500/5",
		},
		{
			label: "Pending Rewards",
			value: displayRewardsNum,
			suffix: " SV",
			decimals: 6,
			icon: Gift,
			color: "text-green-400",
			border: "border-green-500/15",
			bg: "bg-green-500/5",
		},
		{
			label: "APY",
			value: 10,
			suffix: "%",
			prefix: "~",
			decimals: 0,
			icon: Percent,
			color: "text-blue-400",
			border: "border-blue-500/15",
			bg: "bg-blue-500/5",
		},
		{
			label: "Pool Share",
			value: sharePercent,
			suffix: "%",
			decimals: 1,
			icon: Wallet,
			color: "text-violet-400",
			border: "border-violet-500/15",
			bg: "bg-violet-500/5",
			progressBar: true,
			progressValue: sharePercent,
		},
	];

	return (
		<div className="space-y-6">
			<CoinShower
				trigger={showCoinShower}
				onComplete={() => setShowCoinShower(false)}
			/>

			{/* Time Warp effects */}
			<TimeWarpOverlay />
			<TimeWarpHUD />

			{/* Header with status badge */}
			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex items-center justify-between"
			>
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
						<Badge
							variant="secondary"
							className={`rounded-full text-[10px] px-2.5 py-0.5 ${
								isNewUser
									? "border border-border/40 bg-muted/30 text-muted-foreground"
									: "border border-green-500/20 bg-green-500/10 text-green-400"
							}`}
						>
							{isNewUser ? "No Position" : "Active Staker"}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground mt-0.5">
						Manage your SV staking position
					</p>
				</div>
			</m.div>

			{/* Onboarding banner for new users */}
			{isNewUser && (
				<m.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 p-5"
				>
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
							<Sparkles className="h-5 w-5 text-amber-400" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-semibold">Start earning ~10% APY</h3>
							<p className="text-xs text-muted-foreground mt-0.5">
								Approve spending, then stake your SV tokens. Rewards accrue every block.
							</p>
						</div>
						<GlowButton
							variant="primary"
							className="text-xs px-4 py-2 shrink-0"
							onClick={() =>
								document.getElementById("manage-stake")?.scrollIntoView({ behavior: "smooth" })
							}
						>
							Stake Now
						</GlowButton>
					</div>
				</m.div>
			)}

			{/* Overview Stats — pull-up cards */}
			<div id="overview-cards" className="scroll-mt-20 grid grid-cols-2 md:grid-cols-4 gap-3">
				{overviewCards.map((card, i) => (
					<m.div
						key={card.label}
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
						transition={{ duration: 0.4, delay: i * 0.05 }}
						className={`rounded-xl border ${card.border} ${card.bg} p-4 space-y-2 cursor-default`}
					>
						<div className="flex items-center gap-2">
							<card.icon
								className={`h-4 w-4 ${card.color}`}
							/>
							<span className="text-xs text-muted-foreground">
								{card.label}
							</span>
						</div>
						<div
							className={`text-lg font-bold font-mono ${card.color}`}
						>
							{/* Bypass CountUp during warp for Pending Rewards — raw ticking */}
							{isWarping && card.label === "Pending Rewards" ? (
								<span className="tabular-nums">
									{card.prefix ?? ""}{card.value < 1 ? card.value.toFixed(4) : card.value.toFixed(card.decimals)}{card.suffix}
								</span>
							) : (
								<CountUp
									value={card.value}
									decimals={card.decimals}
									suffix={card.suffix}
									prefix={card.prefix}
								/>
							)}
						</div>
						{/* Progress bar for Pool Share */}
						{card.progressBar && (
							<div className="h-1 rounded-full bg-violet-500/10 overflow-hidden">
								<m.div
									className="h-full rounded-full bg-violet-400"
									initial={{ width: 0 }}
									animate={{ width: `${Math.min(card.progressValue ?? 0, 100)}%` }}
									transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
								/>
							</div>
						)}
					</m.div>
				))}
			</div>

			{/* Main Content — Manage Stake first on mobile */}
			<div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
				<div className="space-y-6 order-2 md:order-1">
					<AnimatedCard delay={0.1} glowColor="cyan">
						<StakingInfo />
					</AnimatedCard>
					<AnimatedCard delay={0.2} glowColor="purple">
						<Rewards />
					</AnimatedCard>
				</div>

				<div id="manage-stake" className="scroll-mt-20 order-1 md:order-2">
					<AnimatedCard delay={0.15} glowColor="orange">
						<NeonBorder color="orange">
							<Card className="border-0">
								<CardHeader>
									<CardTitle className="text-base">
										Manage Stake
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Tabs
										defaultValue="stake"
										className="space-y-4"
									>
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger value="stake">
												Stake
											</TabsTrigger>
											<TabsTrigger value="unstake">
												Unstake
											</TabsTrigger>
										</TabsList>
										<TabsContent
											value="stake"
											className="space-y-4"
										>
											<Stake
												onStakeSuccess={
													handleStakeSuccess
												}
											/>
										</TabsContent>
										<TabsContent
											value="unstake"
											className="space-y-4"
										>
											<Unstake />
										</TabsContent>
									</Tabs>
								</CardContent>
							</Card>
						</NeonBorder>
					</AnimatedCard>
				</div>
			</div>

			{/* Earnings Calculator — moved below main content */}
			<AnimatedCard delay={0.25} glowColor="cyan">
				<EarningsCalculator
					initialAmount={stakedNum > 0 ? stakedNum : 100}
					showImagine
					currentRewards={rewardsNum}
				/>
			</AnimatedCard>

			{/* Footer hint */}
			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="text-center pt-4"
			>
				<div className="neon-line mb-6" />
				<p className="text-xs text-muted-foreground/50">
					StakeVault on MIDL Regtest &mdash; Rewards accrue every
					block
				</p>
			</m.div>
		</div>
	);
}

/* ─── Landing (no wallet) ─── */
function Landing({
	openConnectDialog,
	isConnecting,
}: {
	openConnectDialog: () => void;
	isConnecting: boolean;
}) {
	return (
		<div className="space-y-12">
			{/* Fullscreen floating coins */}
			<FloatingCoins count={28} fullscreen />

			{/* Hero */}
			<section className="relative text-center space-y-5 pt-12 pb-4">
				<div className="relative z-10 space-y-5">
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<Badge
							variant="secondary"
							className="rounded-full px-3 py-1 text-xs border border-amber-500/20 bg-amber-500/5 text-amber-400"
						>
							Built on MIDL Network
						</Badge>
					</m.div>
					<m.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
					>
						Bitcoin Staking,{" "}
						<span className="text-gradient">Simplified</span>
					</m.h1>

					{/* Interactive 3D coin */}
					<m.div
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							duration: 0.8,
							delay: 0.15,
							type: "spring",
							stiffness: 120,
						}}
						className="flex justify-center py-4"
					>
						<InteractiveCoin size={100} />
					</m.div>

					<m.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.25 }}
						className="mx-auto max-w-lg text-muted-foreground text-lg"
					>
						Stake your SV tokens and earn ~10% APY rewards. Powered
						by MIDL&apos;s Bitcoin-native EVM.
					</m.p>
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.35 }}
						className="flex justify-center gap-3 pt-3"
					>
						<GlowButton
							variant="primary"
							onClick={openConnectDialog}
							disabled={isConnecting}
							className="text-base px-8 py-3"
						>
							{isConnecting
								? "Connecting..."
								: "Start Staking"}
						</GlowButton>
						<GlowButton
							variant="outline"
							className="text-base px-8 py-3"
							onClick={() =>
								document
									.getElementById("how-it-works")
									?.scrollIntoView({
										behavior: "smooth",
									})
							}
						>
							Learn More
						</GlowButton>
					</m.div>
				</div>
			</section>

			{/* Highlights */}
			<section>
				<ScrollReveal>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{[
							{
								icon: TrendingUp,
								title: "~10% APY",
								desc: "Competitive staking rewards",
								color: "text-green-400",
								bg: "bg-green-500/10 border-green-500/20",
							},
							{
								icon: Shield,
								title: "Bitcoin-Secured",
								desc: "Backed by Bitcoin consensus",
								color: "text-amber-400",
								bg: "bg-amber-500/10 border-amber-500/20",
							},
							{
								icon: Zap,
								title: "Instant Claims",
								desc: "No lockup period required",
								color: "text-blue-400",
								bg: "bg-blue-500/10 border-blue-500/20",
							},
						].map((item) => (
							<m.div
								key={item.title}
								whileHover={{ y: -2 }}
								className={`flex items-center gap-3 rounded-xl border p-4 ${item.bg}`}
							>
								<item.icon
									className={`h-5 w-5 ${item.color}`}
								/>
								<div>
									<p
										className={`text-sm font-semibold ${item.color}`}
									>
										{item.title}
									</p>
									<p className="text-xs text-muted-foreground">
										{item.desc}
									</p>
								</div>
							</m.div>
						))}
					</div>
				</ScrollReveal>
			</section>

			{/* Earnings Calculator CTA */}
			<EarningsSection />

			{/* How It Works */}
			<div id="how-it-works" className="scroll-mt-20">
				<HowItWorks />
			</div>

			{/* Stats */}
			<Stats />

			{/* Features */}
			<div id="features" className="scroll-mt-20">
				<Features />
			</div>

			{/* Footer */}
			<footer className="pt-4 pb-10 text-xs text-muted-foreground">
				<div className="neon-line mb-10" />

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 mb-8">
					{/* Branding */}
					<div className="flex flex-col items-center sm:items-start gap-3">
						<div className="flex items-center gap-2">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-3.5 w-3.5"
								>
									<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
								</svg>
							</div>
							<span className="text-sm font-bold">
								Stake
								<span className="text-gradient">
									Vault
								</span>
							</span>
						</div>
						<p className="text-muted-foreground/60 text-center sm:text-left max-w-[200px]">
							Bitcoin staking, simplified.
							Built on MIDL Network.
						</p>
					</div>

					{/* Links */}
					<div className="flex flex-col items-center gap-2">
						<span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-1">
							Explore
						</span>
						<Link
							href="https://blockscout.staging.midl.xyz"
							target="_blank"
							className="transition-colors hover:text-foreground"
						>
							Block Explorer
						</Link>
						<Link
							href="https://mempool.staging.midl.xyz"
							target="_blank"
							className="transition-colors hover:text-foreground"
						>
							Bitcoin Mempool
						</Link>
						<Link
							href="https://midl.xyz"
							target="_blank"
							className="transition-colors hover:text-foreground"
						>
							MIDL Network
						</Link>
					</div>

					{/* Social + Back to top */}
					<div className="flex flex-col items-center sm:items-end gap-3">
						<span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
							Community
						</span>
						<div className="flex items-center gap-3">
							<Link
								href="https://x.com"
								target="_blank"
								className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-card/50 transition-all hover:border-primary/20 hover:bg-card/80 hover:-translate-y-0.5"
							>
								<svg
									className="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
								</svg>
							</Link>
							<Link
								href="https://github.com"
								target="_blank"
								className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-card/50 transition-all hover:border-primary/20 hover:bg-card/80 hover:-translate-y-0.5"
							>
								<svg
									className="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</Link>
							<Link
								href="https://discord.com"
								target="_blank"
								className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-card/50 transition-all hover:border-primary/20 hover:bg-card/80 hover:-translate-y-0.5"
							>
								<svg
									className="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
								</svg>
							</Link>
						</div>

						<m.button
							onClick={() =>
								window.scrollTo({
									top: 0,
									behavior: "smooth",
								})
							}
							whileHover={{ y: -2 }}
							whileTap={{ scale: 0.95 }}
							className="mt-2 flex items-center gap-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
						>
							<svg
								className="h-3 w-3"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="m18 15-6-6-6 6" />
							</svg>
							Back to top
						</m.button>
					</div>
				</div>

				<div className="neon-line mb-4" />
				<p className="text-center text-muted-foreground/30">
					&copy; 2025 StakeVault. Built on MIDL Regtest.
				</p>
			</footer>
		</div>
	);
}

/* ─── Earnings CTA Card + Modal ─── */
function EarningsSection() {
	const [open, setOpen] = useState(false);

	// Preview projections for the CTA card (100 SV default)
	const previewRewards = [
		{ period: "1 Month", amount: "+0.82 SV", color: "text-green-400" },
		{ period: "6 Months", amount: "+4.93 SV", color: "text-emerald-400" },
		{ period: "1 Year", amount: "+10.00 SV", color: "text-green-300" },
	];

	return (
		<section id="earnings" className="scroll-mt-20">
			<ScrollReveal>
				<m.div
					whileHover={{ y: -4, scale: 1.01 }}
					whileTap={{ scale: 0.99 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 25,
					}}
					onClick={() => setOpen(true)}
					className="relative cursor-pointer group"
				>
					{/* Glow border on hover */}
					<div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/0 via-green-500/0 to-amber-500/0 group-hover:from-amber-500/20 group-hover:via-green-500/20 group-hover:to-amber-500/20 transition-all duration-500 blur-sm" />

					<div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 sm:p-8 overflow-hidden group-hover:border-green-500/20 transition-colors duration-500">
						{/* Subtle background sparkle */}
						<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
							<Sparkles className="h-5 w-5 text-amber-400/40" />
						</div>

						<div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
							{/* Left — Icon + Text */}
							<div className="flex items-center gap-4 flex-1 min-w-0">
								<m.div
									className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20"
									whileHover={{ rotate: 5 }}
								>
									<Calculator className="h-7 w-7 text-green-400" />
								</m.div>
								<div>
									<h3 className="text-lg font-bold">
										Calculate Your{" "}
										<span className="text-gradient">
											Earnings
										</span>
									</h3>
									<p className="text-sm text-muted-foreground mt-0.5">
										See how much you could earn staking
										SV tokens at ~10% APY
									</p>
								</div>
							</div>

							{/* Center — Quick preview numbers */}
							<div className="flex gap-4 sm:gap-6">
								{previewRewards.map((r, i) => (
									<m.div
										key={r.period}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: 0.2 + i * 0.1,
										}}
										className="text-center"
									>
										<div
											className={`text-sm font-bold font-mono ${r.color}`}
										>
											{r.amount}
										</div>
										<div className="text-[10px] text-muted-foreground/60">
											{r.period}
										</div>
									</m.div>
								))}
							</div>

							{/* Right — Arrow CTA */}
							<m.div
								className="flex items-center gap-2 text-sm font-medium text-amber-400 shrink-0"
								animate={{ x: [0, 4, 0] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							>
								<span className="hidden sm:inline">
									Open Calculator
								</span>
								<ArrowRight className="h-4 w-4" />
							</m.div>
						</div>
					</div>
				</m.div>
			</ScrollReveal>

			{/* Calculator Modal */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
					<DialogTitle className="sr-only">
						Earnings Calculator
					</DialogTitle>
					<DialogDescription className="sr-only">
						Calculate projected staking earnings based on amount and time period
					</DialogDescription>
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.3,
							ease: "easeOut",
						}}
					>
						<EarningsCalculator />
					</m.div>
				</DialogContent>
			</Dialog>
		</section>
	);
}
