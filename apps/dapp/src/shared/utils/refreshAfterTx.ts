import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Schedule delayed query refreshes after a MIDL BTC transaction.
 * MIDL EVM state updates only after the wrapping BTC tx confirms (~1 block).
 * This polls at increasing intervals until data is likely refreshed.
 */
export function refreshAfterTx(queryClient: QueryClient, label = "Transaction") {
	const toastId = toast.loading(`${label} sent — waiting for block confirmation...`);

	const delays = [3000, 8000, 15000, 30000, 50000];
	const timers: ReturnType<typeof setTimeout>[] = [];

	for (let i = 0; i < delays.length; i++) {
		timers.push(
			setTimeout(() => {
				queryClient.invalidateQueries();
				// Dismiss loading toast after the second poll (likely confirmed by then)
				if (i === 2) {
					toast.dismiss(toastId);
					toast.success(`${label} confirmed!`);
				}
			}, delays[i]),
		);
	}

	// Immediate invalidation too (in case block was already fast)
	queryClient.invalidateQueries();

	return () => {
		timers.forEach(clearTimeout);
		toast.dismiss(toastId);
	};
}
