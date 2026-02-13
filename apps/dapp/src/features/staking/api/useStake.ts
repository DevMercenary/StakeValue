import { abi, address } from "@/shared/contracts/StakingPool";
import { useMidlWrite } from "./useMidlWrite";

export function useStake() {
	const { writeContract, isPending, error } = useMidlWrite();

	const stake = (token: `0x${string}`, amount: bigint) => {
		return writeContract({
			abi,
			address,
			functionName: "stake",
			args: [token, amount],
		});
	};

	return { stake, isPending, error };
}
