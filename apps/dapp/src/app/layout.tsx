import { Toaster } from "@/components/ui/sonner";
import { FloatingParticles } from "@/components/motion";
import { Web3Provider } from "@/global";
import { Header } from "@/widgets";
import "@midl/satoshi-kit/styles.css";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "StakeVault - Bitcoin Staking on MIDL",
	description:
		"Stake your Bitcoin Rune tokens on the MIDL network and earn ~10% APY rewards.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<Web3Provider>
				<body
					className={`${inter.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
				>
					<FloatingParticles count={40} />
					<Header />
					<main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
						{children}
					</main>
					<Toaster richColors theme="dark" />
				</body>
			</Web3Provider>
		</html>
	);
}
