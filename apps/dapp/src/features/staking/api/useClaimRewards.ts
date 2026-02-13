import { abi, address } from "@/shared/contracts/StakingPool";
import { useMidlWrite } from "./useMidlWrite";

export function useClaimRewards() {
	const { writeContract, isPending, error } = useMidlWrite();

	const claimRewards = (token: `0x${string}`) => {
		return writeContract({
			abi,
			address,
			functionName: "claimRewards",
			args: [token],
		});
	};

	return { claimRewards, isPending, error };
}
