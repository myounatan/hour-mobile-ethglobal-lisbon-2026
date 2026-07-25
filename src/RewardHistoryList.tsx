import { ChevronRight, Gift, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RewardProofModal } from './RewardProofModal';
import { accentAlpha, REWARD_COLORS, S } from './theme';
import type { RewardHistoryEvent } from './types';
import type { RewardProofInput } from './proof';

type RewardHistoryListProps = {
  events: RewardHistoryEvent[];
  emptyLabel?: string;
  /**
   * Enables proof details for each event. The host supplies the request because it owns API
   * authentication and transport.
   */
  fetchProof?: (eventId: string) => Promise<RewardProofInput>;
};

function formatEventDate(occurredAt: string): string {
  return new Date(occurredAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function HistoryRow({
  event,
  isLast,
  onPress,
}: {
  event: RewardHistoryEvent;
  isLast: boolean;
  onPress?: () => void;
}) {
  const isRedeem = event.type === 'redeem';

  const content = (
    <>
      <View style={[styles.icon, isRedeem && styles.iconRedeem]}>
        {isRedeem ? (
          <Gift size={14} color="#fff" />
        ) : (
          <Star
            size={14}
            color={REWARD_COLORS.gold}
            fill={REWARD_COLORS.gold}
          />
        )}
      </View>
      <Text style={styles.label}>
        {isRedeem ? 'Redeem event' : 'Star earned'}
      </Text>
      <Text style={styles.date}>{formatEventDate(event.occurredAt)}</Text>
      {onPress ? <ChevronRight size={17} color={REWARD_COLORS.label3} /> : null}
    </>
  );

  return (
    <Pressable
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? 'View proof details' : undefined}
    >
      {content}
    </Pressable>
  );
}

/** Newest-first timeline of punches earned and rewards claimed. */
export function RewardHistoryList({
  events,
  emptyLabel = 'No activity yet',
  fetchProof,
}: RewardHistoryListProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (events.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <>
      {events.map((event, index) => (
        <HistoryRow
          key={event.id}
          event={event}
          isLast={index === events.length - 1}
          onPress={fetchProof ? () => setSelectedEventId(event.id) : undefined}
        />
      ))}
      {fetchProof ? (
        <RewardProofModal
          visible={selectedEventId != null}
          eventId={selectedEventId}
          fetchProof={fetchProof}
          onRequestClose={() => setSelectedEventId(null)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    borderBottomWidth: 1,
    borderBottomColor: REWARD_COLORS.label4,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentAlpha(0.12),
  },
  iconRedeem: {
    backgroundColor: REWARD_COLORS.success,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: REWARD_COLORS.navy,
  },
  date: {
    fontSize: 13,
    color: REWARD_COLORS.label2,
  },
  empty: {
    paddingVertical: S.lg,
    fontSize: 13,
    textAlign: 'center',
    color: REWARD_COLORS.label3,
  },
});
