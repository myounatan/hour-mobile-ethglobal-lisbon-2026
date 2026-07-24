import { Star } from 'lucide-react-native';
import { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { onCard, PUNCH_CARD_ACCENT } from './theme';

const SLOT_STROKE = 2;
const STAMP_DURATION = 500;
const BURST_DURATION = 600;
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
/** Overshoot curve that gives the stamp its "pop" as it lands. */
const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);

type PunchSlotProps = {
  index: number;
  punched: boolean;
  /** True only for the slot that was just earned, which triggers the burst. */
  justPunched: boolean;
  size: number;
  /** Drops the burst on devices that can't afford it. */
  reduceMotion?: boolean;
};

function BurstRay({
  angle,
  progress,
}: {
  angle: number;
  progress: SharedValue<number>;
}) {
  const rayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 1, 0]),
    transform: [
      { rotate: `${angle}deg` },
      { translateY: interpolate(progress.value, [0, 1], [-6, -22]) },
      { scaleY: interpolate(progress.value, [0, 1], [0.2, 1]) },
    ],
  }));

  return <Animated.View pointerEvents="none" style={[styles.ray, rayStyle]} />;
}

export function PunchSlot({
  index,
  punched,
  justPunched,
  size,
  reduceMotion = false,
}: PunchSlotProps) {
  const animateBurst = justPunched && !reduceMotion;

  const stamp = useSharedValue(justPunched ? 0 : 1);
  const burst = useSharedValue(0);

  // Layout effect so a freshly earned stamp never paints at full size first.
  useLayoutEffect(() => {
    if (!justPunched) {
      stamp.value = punched ? 1 : 0;
      return;
    }
    stamp.value = 0;
    stamp.value = withTiming(1, {
      duration: STAMP_DURATION,
      easing: BACK_OUT,
    });
  }, [justPunched, punched, stamp]);

  useLayoutEffect(() => {
    if (!animateBurst) return;
    burst.value = 0;
    burst.value = withTiming(1, {
      duration: BURST_DURATION,
      easing: Easing.out(Easing.quad),
    });
  }, [animateBurst, burst]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stamp.value,
    transform: [
      { scale: stamp.value },
      { rotate: `${interpolate(stamp.value, [0, 1], [-60, 0])}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(burst.value, [0, 1], [0.7, 0]),
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.35, 1.9]) }],
  }));

  return (
    <View style={[styles.slot, { width: size, height: size }]}>
      {punched ? (
        <View style={[styles.punchedFill, { borderRadius: size / 2 }]} />
      ) : (
        // SVG rather than a dashed border: iOS falls back to a solid border
        // as soon as a border radius is applied.
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={Math.max((size - SLOT_STROKE) / 2, 0)}
            fill={onCard(0.04)}
            stroke={onCard(0.25)}
            strokeWidth={SLOT_STROKE}
            strokeDasharray="5 4"
          />
        </Svg>
      )}

      {punched ? (
        <Animated.View style={stampStyle}>
          <Star
            size={size * 0.5}
            color={PUNCH_CARD_ACCENT}
            fill={PUNCH_CARD_ACCENT}
            strokeWidth={1.5}
          />
        </Animated.View>
      ) : (
        <Text style={styles.slotNumber}>{index + 1}</Text>
      )}

      {animateBurst && (
        <View style={styles.burstLayer} pointerEvents="none">
          <Animated.View
            pointerEvents="none"
            style={[styles.ring, { borderRadius: size / 2 }, ringStyle]}
          />
          {RAY_ANGLES.map((angle) => (
            <BurstRay key={angle} angle={angle} progress={burst} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  punchedFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: onCard(0.1),
  },
  slotNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: onCard(0.35),
  },
  burstLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: PUNCH_CARD_ACCENT,
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: PUNCH_CARD_ACCENT,
  },
});
