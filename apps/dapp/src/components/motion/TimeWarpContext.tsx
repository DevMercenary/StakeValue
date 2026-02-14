"use client";

import {
	createContext,
	useContext,
	useRef,
	useCallback,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { type PeriodKey, TIME_PERIODS } from "@/shared/utils/earnings";

/* ─── Constants ─── */
const APY = 0.1;
const SECONDS_PER_YEAR = 31_536_000;

/**
 * Acceleration ramp (real seconds → warp speed multiplier):
 *   0-2s   : 1x → 1 000x        (ease-in)
 *   2-5s   : 1 000x → 86 400x   (ease-in-out)
 *   5s+    : constant 86 400x
 *
 * When simulatedElapsed reaches targetSeconds we brake to 0 over 0.8s.
 */
const PHASE1_END = 2_000; // ms
const PHASE2_END = 5_000; // ms
const PHASE1_MAX = 1_000;
const PHASE2_MAX = 86_400;

function getWarpSpeed(realElapsedMs: number): number {
	if (realElapsedMs < PHASE1_END) {
		const t = realElapsedMs / PHASE1_END;
		return 1 + (PHASE1_MAX - 1) * (t * t); // ease-in quadratic
	}
	if (realElapsedMs < PHASE2_END) {
		const t = (realElapsedMs - PHASE1_END) / (PHASE2_END - PHASE1_END);
		const ease = t * t * (3 - 2 * t); // smoothstep
		return PHASE1_MAX + (PHASE2_MAX - PHASE1_MAX) * ease;
	}
	return PHASE2_MAX;
}

/* ─── Store (external, avoids full-tree re-renders) ─── */
interface WarpSnapshot {
	stakeAmount: number;
	snapshotRewards: number;
	targetSeconds: number;
	periodKey: PeriodKey;
}

interface WarpStore {
	isWarping: boolean;
	simulatedElapsed: number; // simulated seconds
	realStartMs: number;
	snapshot: WarpSnapshot | null;
	finished: boolean; // true when reached target
}

function createWarpStore() {
	let state: WarpStore = {
		isWarping: false,
		simulatedElapsed: 0,
		realStartMs: 0,
		snapshot: null,
		finished: false,
	};

	const listeners = new Set<() => void>();
	let rafId: number | null = null;

	function emit() {
		for (const fn of listeners) fn();
	}

	function tick() {
		if (!state.isWarping || !state.snapshot) return;

		const now = performance.now();
		const realElapsed = now - state.realStartMs;
		const target = state.snapshot.targetSeconds;

		// Calculate speed based on acceleration ramp
		const speed = getWarpSpeed(realElapsed);

		// Integrate: add dt * speed to simulatedElapsed
		// We approximate dt as 16ms (~60fps)
		const dt = 1 / 60; // seconds per frame
		let newElapsed = state.simulatedElapsed + dt * speed;

		let finished = false;
		if (newElapsed >= target) {
			newElapsed = target;
			finished = true;
		}

		state = {
			...state,
			simulatedElapsed: newElapsed,
			finished,
		};
		emit();

		if (finished) {
			// Auto-stop after a brief pause
			setTimeout(() => {
				// Don't stop if user already stopped
				if (state.isWarping && state.finished) {
					// Keep showing final state, user clicks "Back to Reality"
				}
			}, 500);
		}

		if (!finished) {
			rafId = requestAnimationFrame(tick);
		}
	}

	return {
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},

		getSnapshot(): WarpStore {
			return state;
		},

		startWarp(
			stakeAmount: number,
			periodKey: PeriodKey,
			currentRewards: number,
		) {
			const period = TIME_PERIODS.find((p) => p.key === periodKey);
			if (!period) return;

			state = {
				isWarping: true,
				simulatedElapsed: 0,
				realStartMs: performance.now(),
				snapshot: {
					stakeAmount,
					snapshotRewards: currentRewards,
					targetSeconds: period.seconds,
					periodKey,
				},
				finished: false,
			};
			emit();

			if (rafId) cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(tick);
		},

		stopWarp() {
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			state = {
				isWarping: false,
				simulatedElapsed: 0,
				realStartMs: 0,
				snapshot: null,
				finished: false,
			};
			emit();
		},

		getSimulatedRewards(): number {
			if (!state.snapshot) return 0;
			const { stakeAmount, snapshotRewards } = state.snapshot;
			const additional =
				stakeAmount * APY * (state.simulatedElapsed / SECONDS_PER_YEAR);
			return snapshotRewards + additional;
		},
	};
}

type WarpStoreType = ReturnType<typeof createWarpStore>;

/* ─── React Context ─── */
const TimeWarpCtx = createContext<WarpStoreType | null>(null);

export function TimeWarpProvider({ children }: { children: ReactNode }) {
	const storeRef = useRef<WarpStoreType | null>(null);
	if (!storeRef.current) {
		storeRef.current = createWarpStore();
	}
	return (
		<TimeWarpCtx.Provider value={storeRef.current}>
			{children}
		</TimeWarpCtx.Provider>
	);
}

export function useTimeWarp() {
	const store = useContext(TimeWarpCtx);
	if (!store) throw new Error("useTimeWarp must be inside TimeWarpProvider");

	const state = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);

	return {
		isWarping: state.isWarping,
		simulatedElapsed: state.simulatedElapsed,
		snapshot: state.snapshot,
		finished: state.finished,
		targetSeconds: state.snapshot?.targetSeconds ?? 0,
		startWarp: store.startWarp,
		stopWarp: store.stopWarp,
		getSimulatedRewards: store.getSimulatedRewards,
	};
}
