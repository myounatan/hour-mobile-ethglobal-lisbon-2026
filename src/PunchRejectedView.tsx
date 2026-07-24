import { AlertTriangle } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { onCard, PUNCH_CARD_SURFACE, REWARD_COLORS, S } from './theme';

type PunchRejectedViewProps = {
  reason: string;
  onRetry: () => void;
  onClose: () => void;
};

/** Shown when the verification pipeline declines the captured photo. */
export function PunchRejectedView({
  reason,
  onRetry,
  onClose,
}: PunchRejectedViewProps) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <AlertTriangle size={26} color="#fff" />
      </View>
      <Text style={styles.title}>Please try again later</Text>
      <Text style={styles.reason}>{reason}</Text>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.85}
      >
        <Text style={styles.retryLabel}>Retake photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeLabel}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.xl,
    backgroundColor: PUNCH_CARD_SURFACE,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: REWARD_COLORS.danger,
    marginBottom: S.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: onCard(1),
    textAlign: 'center',
  },
  reason: {
    marginTop: S.xxs,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: onCard(0.65),
  },
  retryButton: {
    marginTop: S.lg,
    minHeight: 48,
    minWidth: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: REWARD_COLORS.pink,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  closeLabel: {
    marginTop: S.md,
    fontSize: 14,
    fontWeight: '500',
    color: onCard(0.6),
  },
});
