import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { onCard, PUNCH_CARD_SURFACE, REWARD_COLORS, S } from './theme';

type QrRedemptionResultViewProps = {
  outcome: 'approved' | 'rejected';
  message: string;
  onScanAnother: () => void;
  onDone: () => void;
};

/** Shown after a scanned redemption code has been verified, whichever way it went. */
export function QrRedemptionResultView({
  outcome,
  message,
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
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.primaryButton}
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
    backgroundColor: REWARD_COLORS.pink,
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
  message: {
    marginTop: S.xxs,
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
    backgroundColor: REWARD_COLORS.pink,
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
