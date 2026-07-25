import { useEffect, useRef, useState } from 'react';

/** One step of a slow pipeline: what to tell the user, and roughly how long it takes. */
export type ProgressStage = {
  label: string;
  durationMs: number;
};

const TICK_MS = 120;
/** The bar eases toward this and never reaches it — only a real answer completes it. */
const CEILING = 0.96;
/** How fast the bar fills relative to the stages' total time. */
const FILL_RATE = 2.5;

function labelAt(stages: ProgressStage[], elapsedMs: number): string {
  let remaining = elapsedMs;
  for (const stage of stages) {
    if (remaining < stage.durationMs) return stage.label;
    remaining -= stage.durationMs;
  }
  return stages[stages.length - 1]?.label ?? '';
}

/**
 * Drives a progress bar for a request whose real progress can't be measured.
 *
 * Labels advance on the stages' own timings while the bar eases asymptotically toward
 * `CEILING`, so a slower-than-usual run keeps inching forward instead of sitting at a full
 * bar. Timing starts on mount, so mount the consumer when the work begins.
 */
export function useStagedProgress(stages: ProgressStage[]): {
  label: string;
  progress: number;
} {
  const startedAt = useRef(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setElapsedMs(Date.now() - startedAt.current),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const totalMs = stages.reduce((sum, stage) => sum + stage.durationMs, 0) || 1;
  const progress = CEILING * (1 - Math.exp((-FILL_RATE * elapsedMs) / totalMs));

  return { label: labelAt(stages, elapsedMs), progress };
}
