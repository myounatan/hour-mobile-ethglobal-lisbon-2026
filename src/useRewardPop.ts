import { useEffect } from 'react';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const POP_DURATION = 500;
/** Overshoot curve — carries the scale past 1 for the bump, then settles. */
const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Scale + fade "pop" used when a reward is unlocked or redeemed. */
export function useRewardPop(active: boolean) {
  const pop = useSharedValue(active ? 0 : 1);

  useEffect(() => {
    if (!active) {
      pop.value = 1;
      return;
    }
    pop.value = 0;
    pop.value = withTiming(1, { duration: POP_DURATION, easing: BACK_OUT });
  }, [active, pop]);

  return useAnimatedStyle(() => ({
    opacity: interpolate(pop.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(pop.value, [0, 1], [0.8, 1]) }],
  }));
}
