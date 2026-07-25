import { RefreshCw, X } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, REWARD_COLORS, S } from './theme';
import type { RedemptionCode } from './redemption';
import { useCountdown } from './useCountdown';

const QR_SIZE = 240;

type RedemptionQrViewProps = {
  code: RedemptionCode;
  rewardDescription: string;
  onRefresh: () => void;
  onClose: () => void;
};

/**
 * The customer's side of a redemption: the code itself, on a light panel so it scans, with the
 * time left under it.
 *
 * The QR is drawn locally rather than fetched as an image — a live token has no business
 * travelling to a third-party generator, and a code that needs a network to be *shown* is a code
 * that fails at the till.
 */
export function RedemptionQrView({
  code,
  rewardDescription,
  onRefresh,
  onClose,
}: RedemptionQrViewProps) {
  const { isExpired, label } = useCountdown(code.expiresAt);

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.8}
        hitSlop={8}
      >
        <X size={20} color={onCard(0.9)} />
      </TouchableOpacity>

      <Text style={styles.title}>Show this to staff</Text>
      <Text style={styles.reward}>{rewardDescription}</Text>

      <View style={styles.panel}>
        <QRCode
          value={code.qrPayload}
          size={QR_SIZE}
          color={REWARD_COLORS.navy}
          backgroundColor="#fff"
        />
        {isExpired && <View style={styles.expiredScrim} />}
      </View>

      {isExpired ? (
        <>
          <Text style={styles.expiredLabel}>This code has expired</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.85}
          >
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.refreshLabel}>Get a new code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.countdown}>
          {label ? `Expires in ${label}` : 'Ready to scan'}
        </Text>
      )}
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
  closeButton: {
    position: 'absolute',
    top: S.xxl,
    right: S.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: onCard(0.12),
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: onCard(1),
  },
  reward: {
    marginTop: S.xxs,
    marginBottom: S.lg,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: onCard(0.65),
  },
  panel: {
    padding: S.lg,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  expiredScrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(39,40,56,0.75)',
  },
  countdown: {
    marginTop: S.lg,
    fontSize: 13,
    fontWeight: '500',
    color: onCard(0.6),
  },
  expiredLabel: {
    marginTop: S.lg,
    fontSize: 14,
    fontWeight: '600',
    color: PUNCH_CARD_ACCENT,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    marginTop: S.sm,
    minHeight: 48,
    minWidth: 200,
    borderRadius: 100,
    backgroundColor: PUNCH_CARD_ACCENT,
  },
  refreshLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
