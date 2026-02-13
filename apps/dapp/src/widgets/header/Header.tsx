"use client";

import { ConnectButton } from "@midl/satoshi-kit";
import Link from "next/link";

export const Header = () => {
	return (
		<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
				<div className="flex items-center gap-8">
					<Link href="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
							Stake<span className="text-primary">Vault</span>
						</span>
					</Link>
					<nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
						<Link
							href="https://blockscout.staging.midl.xyz"
							target="_blank"
							className="transition-colors hover:text-foreground"
						>
							Explorer
						</Link>
						<Link
							href="https://mempool.staging.midl.xyz"
							target="_blank"
							className="transition-colors hover:text-foreground"
						>
							Mempool
						</Link>
						<Link
							href="https://faucet.staging.midl.xyz"
							target="_blank"
							className="transition-colors hover:text-foreground"
						>
							Faucet
						</Link>
					</nav>
				</div>
				<ConnectButton />
			</div>
		</header>
	);
};
