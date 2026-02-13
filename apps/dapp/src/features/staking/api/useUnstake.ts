import { abi, address } from "@/shared/contracts/StakingPool";
import { useMidlWrite } from "./useMidlWrite";

export function useUnstake() {
	const { writeContract, isPending, error } = useMidlWrite();

	const unstake = (token: `0x${string}`, amount: bigint) => {
		return writeContract({
			abi,
			address,
			functionName: "unstake",
			args: [token, amount],
		});
	};

	return { isPending, unstake, error };
}
