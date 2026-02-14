"use client";

import { ConnectButton } from "@midl/satoshi-kit";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GlowButton } from "@/components/motion";

const LANDING_SECTIONS = [
	{ id: "earnings", label: "Earnings" },
	{ id: "how-it-works", label: "How It Works" },
	{ id: "features", label: "Features" },
] as const;

const EXTERNAL_LINKS = [
	{
		href: "https://blockscout.staging.midl.xyz",
		label: "Explorer",
	},
	{
		href: "https://mempool.staging.midl.xyz",
		label: "Mempool",
	},
	{
		href: "https://faucet.staging.midl.xyz",
		label: "Faucet",
	},
];

export const Header = () => {
	const [activeSection, setActiveSection] = useState<string>("");
	const [mobileOpen, setMobileOpen] = useState(false);

	const scrollTo = useCallback(
		(id: string) => {
			document
				.getElementById(id)
				?.scrollIntoView({ behavior: "smooth" });
			setMobileOpen(false);
		},
		[],
	);

	return (
		<LazyMotion features={domAnimation}>
			<m.header
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl"
			>
				<ConnectButton>
					{({
						openConnectDialog,
						openAccountDialog,
						isConnected,
						isConnecting,
					}) => (
						<>
							<HeaderInner
								isConnected={isConnected}
								isConnecting={isConnecting}
								openConnectDialog={openConnectDialog}
								openAccountDialog={openAccountDialog}
								activeSection={activeSection}
								setActiveSection={setActiveSection}
								scrollTo={scrollTo}
								mobileOpen={mobileOpen}
								setMobileOpen={setMobileOpen}
							/>

							{/* Mobile dropdown */}
							<AnimatePresence>
								{mobileOpen && (
									<m.div
										initial={{
											height: 0,
											opacity: 0,
										}}
										animate={{
											height: "auto",
											opacity: 1,
										}}
										exit={{
											height: 0,
											opacity: 0,
										}}
										transition={{
											duration: 0.25,
											ease: "easeInOut",
										}}
										className="overflow-hidden sm:hidden border-t border-border/20"
									>
										<nav className="flex flex-col gap-1 p-3">
											{isConnected
												? EXTERNAL_LINKS.map(
														(link) => (
															<Link
																key={
																	link.label
																}
																href={
																	link.href
																}
																target="_blank"
																onClick={() =>
																	setMobileOpen(
																		false,
																	)
																}
																className="px-4 py-2.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-white/5"
															>
																{
																	link.label
																}
															</Link>
														),
													)
												: LANDING_SECTIONS.map(
														(section) => (
															<button
																key={
																	section.id
																}
																onClick={() =>
																	scrollTo(
																		section.id,
																	)
																}
																className={`px-4 py-2.5 rounded-lg text-sm text-left transition-colors cursor-pointer ${
																	activeSection ===
																	section.id
																		? "text-foreground bg-white/5 border border-primary/15"
																		: "text-muted-foreground hover:text-foreground hover:bg-white/5"
																}`}
															>
																{
																	section.label
																}
															</button>
														),
													)}
										</nav>
									</m.div>
								)}
							</AnimatePresence>
						</>
					)}
				</ConnectButton>
				<div className="neon-line" />
			</m.header>
		</LazyMotion>
	);
};

function HeaderInner({
	isConnected,
	isConnecting,
	openConnectDialog,
	openAccountDialog,
	activeSection,
	setActiveSection,
	scrollTo,
	mobileOpen,
	setMobileOpen,
}: {
	isConnected: boolean;
	isConnecting: boolean;
	openConnectDialog: () => void;
	openAccountDialog: () => void;
	activeSection: string;
	setActiveSection: (s: string) => void;
	scrollTo: (id: string) => void;
	mobileOpen: boolean;
	setMobileOpen: (v: boolean) => void;
}) {
	// Scroll spy — track which section is in view (only on landing)
	useEffect(() => {
		if (isConnected) return;

		const handleScroll = () => {
			// If scrolled to bottom, activate last section
			const atBottom =
				window.innerHeight + window.scrollY >=
				document.body.scrollHeight - 50;
			if (atBottom) {
				setActiveSection(
					LANDING_SECTIONS[LANDING_SECTIONS.length - 1].id,
				);
				return;
			}

			const sections = LANDING_SECTIONS.map((s) => ({
				id: s.id,
				el: document.getElementById(s.id),
			}));

			let current = "";
			for (const { id, el } of sections) {
				if (!el) continue;
				const rect = el.getBoundingClientRect();
				if (rect.top <= 120) {
					current = id;
				}
			}
			setActiveSection(current);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, [isConnected, setActiveSection]);

	return (
		<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
			<div className="flex items-center gap-8">
				<Link href="/" className="flex items-center gap-2 group">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_rgba(247,147,26,0.2)]">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-4 w-4"
						>
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					</div>
					<span className="text-lg font-bold tracking-tight">
						Stake
						<span className="text-gradient">Vault</span>
					</span>
				</Link>

				{/* Desktop nav */}
				<nav className="hidden items-center gap-1 text-sm sm:flex">
					{isConnected
						? EXTERNAL_LINKS.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									target="_blank"
									className="px-3 py-1.5 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-white/5"
								>
									{link.label}
								</Link>
							))
						: LANDING_SECTIONS.map((section) => (
								<button
									key={section.id}
									onClick={() => scrollTo(section.id)}
									className={`relative px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
										activeSection === section.id
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-white/5"
									}`}
								>
									{section.label}
									{activeSection === section.id && (
										<m.div
											layoutId="nav-indicator"
											className="absolute inset-0 rounded-lg bg-white/5 border border-primary/15"
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 30,
											}}
										/>
									)}
								</button>
							))}
				</nav>
			</div>

			<div className="flex items-center gap-3">
				{/* Mobile hamburger */}
				<m.button
					onClick={() => setMobileOpen(!mobileOpen)}
					whileTap={{ scale: 0.9 }}
					className="sm:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 cursor-pointer"
					aria-label="Toggle menu"
				>
					<m.span
						animate={
							mobileOpen
								? { rotate: 45, y: 5 }
								: { rotate: 0, y: 0 }
						}
						transition={{ duration: 0.2 }}
						className="block w-5 h-[1.5px] bg-foreground/70 rounded-full"
					/>
					<m.span
						animate={
							mobileOpen
								? { opacity: 0, x: -10 }
								: { opacity: 1, x: 0 }
						}
						transition={{ duration: 0.15 }}
						className="block w-5 h-[1.5px] bg-foreground/70 rounded-full"
					/>
					<m.span
						animate={
							mobileOpen
								? { rotate: -45, y: -5 }
								: { rotate: 0, y: 0 }
						}
						transition={{ duration: 0.2 }}
						className="block w-5 h-[1.5px] bg-foreground/70 rounded-full"
					/>
				</m.button>

				{isConnected ? (
					<button
						onClick={openAccountDialog}
						className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all cursor-pointer hover:bg-primary/10 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(247,147,26,0.1)]"
					>
						Account
					</button>
				) : (
					<GlowButton
						onClick={openConnectDialog}
						disabled={isConnecting}
						variant="primary"
						className="text-sm py-2 px-5"
					>
						{isConnecting ? "Connecting..." : "Connect Wallet"}
					</GlowButton>
				)}
			</div>
		</div>
	);
}
