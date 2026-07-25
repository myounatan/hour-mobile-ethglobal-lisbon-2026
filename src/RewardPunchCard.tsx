import { Gift, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PunchSlot } from './PunchSlot';
import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, S } from './theme';
import { useRewardPop } from './useRewardPop';

const MAX_SLOTS_PER_ROW = 5;
const SLOT_GAP = 10;
const PROGRESS_DURATION = 500;

type RewardPunchCardProps = {
  venueName: string;
  venueAddress?: string | null;
  punchesEarned: number;
  punchesRequired: number;
  rewardDescription: string;
  /** Slot index that was just earned — the only one that plays the burst. */
  justPunchedIndex?: number | null;
  /** Replays the card pop, e.g. right after a redemption resets the card. */
  celebrating?: boolean;
  /** Skips the per-slot burst, for low-tier devices. */
  reduceMotion?: boolean;
};

export function RewardPunchCard({
  venueName,
  venueAddress,
  punchesEarned,
  punchesRequired,
  rewardDescription,
  justPunchedIndex = null,
  celebrating = false,
  reduceMotion = false,
}: RewardPunchCardProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const progress = useSharedValue(
    punchesRequired > 0 ? Math.min(punchesEarned / punchesRequired, 1) : 0,
  );
  const popStyle = useRewardPop(celebrating);

  const complete = punchesEarned >= punchesRequired;
  const remaining = Math.max(punchesRequired - punchesEarned, 0);

  useEffect(() => {
    const next =
      punchesRequired > 0 ? Math.min(punchesEarned / punchesRequired, 1) : 0;
    progress.value = withTiming(next, {
      duration: PROGRESS_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [punchesEarned, punchesRequired, progress]);

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const columns = Math.min(punchesRequired, MAX_SLOTS_PER_ROW);
  const slotSize =
    gridWidth > 0 && columns > 0
      ? (gridWidth - SLOT_GAP * (columns - 1)) / columns
      : 0;

  const onGridLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  return (
    <Animated.View style={[styles.card, popStyle]}>
      <View style={styles.header}>
        <View style={styles.head}>
          <View style={styles.identity}>
            <View style={styles.badge}>
              <Gift size={20} color={PUNCH_CARD_SURFACE} strokeWidth={2} />
            </View>
            <View style={styles.identityText}>
              <Text style={styles.venueName} numberOfLines={1}>
                {venueName}
              </Text>
              {venueAddress ? (
                <View style={styles.addressRow}>
                  <MapPin size={12} color={onCard(0.6)} />
                  <Text style={styles.address} numberOfLines={1}>
                    {venueAddress}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.memberPill}>
            <Text style={styles.memberPillText}>Member</Text>
          </View>
        </View>

        <Text style={styles.tagline}>{rewardDescription}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.grid} onLayout={onGridLayout}>
          {slotSize > 0 &&
            Array.from({ length: punchesRequired }).map((_, index) => (
              <PunchSlot
                // eslint-disable-next-line react/no-array-index-key -- slots are a fixed positional sequence
                key={index}
                index={index}
                size={slotSize}
                punched={index < punchesEarned}
                justPunched={justPunchedIndex === index && index < punchesEarned}
                reduceMotion={reduceMotion}
              />
            ))}
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressPrimary}>
              {complete
                ? 'Reward ready'
                : `${punchesEarned} of ${punchesRequired} stars`}
            </Text>
            <Text style={styles.progressSecondary}>
              {complete ? 'Ready to redeem' : `${remaining} to go`}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressFillStyle]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PUNCH_CARD_SURFACE,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: PUNCH_CARD_SURFACE,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  header: {
    paddingHorizontal: S.xl,
    paddingTop: S.xl,
    paddingBottom: S.lg,
    backgroundColor: onCard(0.06),
  },
  body: {
    paddingHorizontal: S.xl,
    paddingTop: S.lg,
    paddingBottom: S.xl,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  identityText: {
    flex: 1,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PUNCH_CARD_ACCENT,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: onCard(1),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xxs,
    marginTop: 2,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: onCard(0.6),
  },
  memberPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: onCard(0.1),
  },
  memberPillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: onCard(0.7),
  },
  tagline: {
    marginTop: S.lg,
    fontSize: 14,
    lineHeight: 20,
    color: onCard(0.75),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SLOT_GAP,
  },
  progressBlock: {
    marginTop: S.lg,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.xs,
  },
  progressPrimary: {
    fontSize: 12,
    fontWeight: '500',
    color: onCard(0.8),
  },
  progressSecondary: {
    fontSize: 12,
    color: onCard(0.55),
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: onCard(0.15),
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: PUNCH_CARD_ACCENT,
  },
});
