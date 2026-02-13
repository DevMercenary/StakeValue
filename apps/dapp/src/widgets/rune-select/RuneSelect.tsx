"use client";

import { useRuneStore } from "@/features";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const RuneSelect = () => {
	const { rune, setRune } = useRuneStore();

	return (
		<div className="space-y-2">
			<Label htmlFor="rune-id" className="text-sm font-medium">
				Rune ID
			</Label>
			<Input
				id="rune-id"
				placeholder="Enter Rune ID (e.g. 1:0)"
				value={rune || ""}
				onChange={(e) => setRune(e.target.value)}
				className="font-mono text-sm"
			/>
		</div>
	);
};
