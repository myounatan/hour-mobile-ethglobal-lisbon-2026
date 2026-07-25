import { Gift, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { accentAlpha, REWARD_COLORS, S } from './theme';
import type { RewardHistoryEvent } from './types';

type RewardHistoryListProps = {
  events: RewardHistoryEvent[];
  emptyLabel?: string;
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
}: {
  event: RewardHistoryEvent;
  isLast: boolean;
}) {
  const isRedeem = event.type === 'redeem';

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
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
    </View>
  );
}

/** Newest-first timeline of punches earned and rewards claimed. */
export function RewardHistoryList({
  events,
  emptyLabel = 'No activity yet',
}: RewardHistoryListProps) {
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
        />
      ))}
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
