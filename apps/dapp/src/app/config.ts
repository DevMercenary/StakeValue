import { type Config, MaestroSymphonyProvider, regtest } from "@midl/core";
import { createMidlConfig } from "@midl/satoshi-kit";
import { QueryClient } from "@tanstack/react-query";

export const midlConfig = createMidlConfig({
	networks: [regtest],
	persist: true,
	runesProvider: new MaestroSymphonyProvider({
		regtest: "https://runes.staging.midl.xyz",
	}),
}) as Config;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			experimental_prefetchInRender: true,
		},
	},
});
