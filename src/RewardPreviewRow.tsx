import { ChevronRight, Gift } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { accentAlpha, PUNCH_CARD_ACCENT, REWARD_COLORS, S } from './theme';

type RewardPreviewRowProps = {
  punchesEarned: number;
  punchesRequired: number;
  /** Trailing call to action, e.g. on a venue page that links to the full card. */
  actionLabel?: string;
};

/**
 * Compact one-line summary of a card's progress, for embedding in a list or a card
 * the host app owns. Wrap it in whatever surface and press handler you need.
 */
export function RewardPreviewRow({
  punchesEarned,
  punchesRequired,
  actionLabel = 'View rewards',
}: RewardPreviewRowProps) {
  const complete = punchesEarned >= punchesRequired;

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Gift size={18} color={PUNCH_CARD_ACCENT} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Rewards</Text>
        <Text style={styles.subtitle}>
          {complete
            ? 'Reward ready to redeem'
            : `${punchesEarned}/${punchesRequired} stars`}
        </Text>
      </View>
      <Text style={styles.action}>{actionLabel}</Text>
      <ChevronRight size={16} color={PUNCH_CARD_ACCENT} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentAlpha(0.12),
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: REWARD_COLORS.navy,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 13,
    color: REWARD_COLORS.label3,
  },
  action: {
    fontSize: 13,
    fontWeight: '500',
    color: PUNCH_CARD_ACCENT,
  },
});
