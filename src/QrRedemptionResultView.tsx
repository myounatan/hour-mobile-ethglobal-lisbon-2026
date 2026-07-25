import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { onCard, PUNCH_CARD_SURFACE, REWARD_COLORS, S } from './theme';

type QrRedemptionResultViewProps = {
  outcome: 'approved' | 'rejected';
  message: string;
  /** What the venue now owes the customer, shown on approval. */
  rewardDescription?: string;
  onScanAnother: () => void;
  onDone: () => void;
};

/** Shown after a scanned redemption code has been verified, whichever way it went. */
export function QrRedemptionResultView({
  outcome,
  message,
  rewardDescription,
  onScanAnother,
  onDone,
}: QrRedemptionResultViewProps) {
  const approved = outcome === 'approved';

  return (
    <View style={styles.root}>
      <View style={[styles.icon, approved ? styles.iconApproved : styles.iconRejected]}>
        {approved ? (
          <CheckCircle2 size={28} color="#fff" />
        ) : (
          <AlertTriangle size={28} color="#fff" />
        )}
      </View>
      <Text style={styles.title}>
        {approved ? 'Reward redeemed' : 'Could not redeem'}
      </Text>
      {approved && rewardDescription ? (
        <View style={styles.reward}>
          <Text style={styles.rewardLabel}>Give them</Text>
          <Text style={styles.rewardValue}>{rewardDescription}</Text>
        </View>
      ) : null}
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          approved ? styles.primaryApproved : styles.primaryRejected,
        ]}
        onPress={onScanAnother}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryLabel}>Scan another</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDone}>
        <Text style={styles.doneLabel}>Done</Text>
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
    marginBottom: S.xs,
  },
  iconApproved: {
    backgroundColor: REWARD_COLORS.success,
  },
  iconRejected: {
    backgroundColor: REWARD_COLORS.danger,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: onCard(1),
    textAlign: 'center',
  },
  reward: {
    alignItems: 'center',
    gap: S.xxs,
    marginTop: S.md,
    paddingVertical: S.sm,
    paddingHorizontal: S.lg,
    borderRadius: 16,
    backgroundColor: onCard(0.1),
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: onCard(0.55),
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: onCard(1),
  },
  message: {
    marginTop: S.sm,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: onCard(0.65),
  },
  primaryButton: {
    marginTop: S.lg,
    minHeight: 48,
    minWidth: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryApproved: {
    backgroundColor: REWARD_COLORS.success,
  },
  primaryRejected: {
    backgroundColor: REWARD_COLORS.danger,
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  doneLabel: {
    marginTop: S.md,
    fontSize: 14,
    fontWeight: '500',
    color: onCard(0.6),
  },
});
