import { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { PunchRejectedView } from './PunchRejectedView';
import { RedemptionQrView } from './RedemptionQrView';
import { PUNCH_CARD_SURFACE } from './theme';
import type { RedemptionCode } from './redemption';
import { VerificationProcessingView } from './VerificationProcessingView';

type Stage = 'loading' | 'ready' | 'error';

const REQUEST_FAILED =
  'We could not get your code just now. Check your connection and try again.';

type RewardQrCodeModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  rewardDescription: string;
  /** Asks the backend for a code to show. Called on open, and again on expiry. */
  requestCode: () => Promise<RedemptionCode>;
};

/**
 * Full-screen flow started from the "Show QR code" button on a full punch card: ask for a code,
 * show it until staff scan it or it runs out, and offer a fresh one when it does.
 *
 * A code is fetched per opening rather than held onto, since the one thing this screen must
 * never do is display a code that has quietly stopped working. The backend hands back the same
 * code for as long as it is alive, so reopening this is cheap.
 */
export function RewardQrCodeModal({
  visible,
  onRequestClose,
  rewardDescription,
  requestCode,
}: RewardQrCodeModalProps) {
  const [stage, setStage] = useState<Stage>('loading');
  const [code, setCode] = useState<RedemptionCode | null>(null);

  const load = useCallback(async () => {
    setStage('loading');
    try {
      setCode(await requestCode());
      setStage('ready');
    } catch {
      setStage('error');
    }
  }, [requestCode]);

  useEffect(() => {
    if (!visible) return;
    void load();
  }, [load, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}
    >
      <View style={styles.root}>
        {stage === 'loading' && (
          <VerificationProcessingView
            title="Getting your code…"
            body="One moment."
          />
        )}
        {stage === 'ready' && code && (
          <RedemptionQrView
            code={code}
            rewardDescription={rewardDescription}
            onRefresh={load}
            onClose={onRequestClose}
          />
        )}
        {stage === 'error' && (
          <PunchRejectedView
            title="Could not get your code"
            reason={REQUEST_FAILED}
            retryLabel="Try again"
            onRetry={load}
            onClose={onRequestClose}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PUNCH_CARD_SURFACE,
  },
});
