import { useEffect, useState } from 'react';

const TICK_MS = 500;

export type Countdown = {
  /** Seconds left, or `null` when there is no deadline to count towards. */
  secondsLeft: number | null;
  isExpired: boolean;
  /** `m:ss`, or an empty string when there is no deadline. */
  label: string;
};

/**
 * Counts down to a `Date.now()` deadline.
 *
 * Ticks twice a second rather than once, so the number on screen is never a whole second stale
 * — at five minutes' notice, a visibly frozen clock is the difference between "still fine" and
 * "hurry up".
 */
export function useCountdown(deadline: number | null): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline === null) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [deadline]);

  if (deadline === null) {
    return { secondsLeft: null, isExpired: false, label: '' };
  }

  const secondsLeft = Math.max(Math.ceil((deadline - now) / 1000), 0);
  return {
    secondsLeft,
    isExpired: secondsLeft === 0,
    label: formatCountdown(secondsLeft),
  };
}

function formatCountdown(secondsLeft: number): string {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
