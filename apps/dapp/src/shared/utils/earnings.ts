export const TIME_PERIODS = [
	{ label: "1D", seconds: 86_400, key: "1d", fullLabel: "1 Day" },
	{ label: "1W", seconds: 604_800, key: "1w", fullLabel: "1 Week" },
	{ label: "1M", seconds: 2_592_000, key: "1m", fullLabel: "1 Month" },
	{ label: "3M", seconds: 7_776_000, key: "3m", fullLabel: "3 Months" },
	{ label: "6M", seconds: 15_552_000, key: "6m", fullLabel: "6 Months" },
	{ label: "1Y", seconds: 31_536_000, key: "1y", fullLabel: "1 Year" },
] as const;

export type PeriodKey = (typeof TIME_PERIODS)[number]["key"];

export interface ChartDataPoint {
	t: number; // fraction 0..1
	label: string;
	principal: number;
	rewards: number;
	total: number;
}

const SECONDS_PER_YEAR = 31_536_000;
const POINT_COUNT = 7;

export function generateChartData(
	stakedAmount: number,
	apyPercent: number,
	periodKey: PeriodKey,
): ChartDataPoint[] {
	const period = TIME_PERIODS.find((p) => p.key === periodKey)!;
	const rate = apyPercent / 100;

	return Array.from({ length: POINT_COUNT }, (_, i) => {
		const fraction = i / (POINT_COUNT - 1);
		const seconds = period.seconds * fraction;
		const rewards = stakedAmount * rate * (seconds / SECONDS_PER_YEAR);

		let label: string;
		if (i === 0) {
			label = "Now";
		} else if (periodKey === "1d") {
			label = `${Math.round((seconds / 3600))}h`;
		} else if (periodKey === "1w") {
			label = `${Math.round(seconds / 86_400)}d`;
		} else {
			const days = Math.round(seconds / 86_400);
			label = days < 30 ? `${days}d` : `${Math.round(days / 30)}mo`;
		}

		return {
			t: fraction,
			label,
			principal: stakedAmount,
			rewards: Math.round(rewards * 1e6) / 1e6,
			total: Math.round((stakedAmount + rewards) * 1e6) / 1e6,
		};
	});
}

export function calculateAllProjections(
	stakedAmount: number,
	apyPercent: number,
): Record<PeriodKey, number> {
	const rate = apyPercent / 100;
	return Object.fromEntries(
		TIME_PERIODS.map((p) => [
			p.key,
			Math.round(stakedAmount * rate * (p.seconds / SECONDS_PER_YEAR) * 1e6) / 1e6,
		]),
	) as Record<PeriodKey, number>;
}
