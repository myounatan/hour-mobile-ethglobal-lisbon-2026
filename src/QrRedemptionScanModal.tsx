import { useCallback, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { PUNCH_CARD_SURFACE } from './theme';
import type { QrRedemptionVerificationResult } from './types';
import { QrRedemptionResultView } from './QrRedemptionResultView';
import { QrScannerView } from './QrScannerView';
import { VerificationProcessingView } from './VerificationProcessingView';

type Stage = 'scanning' | 'processing' | 'result';

type QrRedemptionScanModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  /** Uploads the scanned code and resolves with the verification outcome. */
  verifyRedemptionQr: (
    qrData: string,
  ) => Promise<QrRedemptionVerificationResult>;
};

/**
 * Full-screen flow started from the venue owner's "Scan QR Code" menu item:
 * scan a customer's redemption code, submit it for verification, then show
 * whether it was approved or rejected.
 */
export function QrRedemptionScanModal({
  visible,
  onRequestClose,
  verifyRedemptionQr,
}: QrRedemptionScanModalProps) {
  const [stage, setStage] = useState<Stage>('scanning');
  const [outcome, setOutcome] = useState<'approved' | 'rejected'>('approved');
  const [resultMessage, setResultMessage] = useState('');

  const reset = useCallback(() => {
    setStage('scanning');
    setResultMessage('');
  }, []);

  const handleClose = useCallback(() => {
    onRequestClose();
    reset();
  }, [onRequestClose, reset]);

  const handleScanned = useCallback(
    async (qrData: string) => {
      setStage('processing');
      try {
        const result = await verifyRedemptionQr(qrData);
        if (result.approved) {
          setOutcome('approved');
          setResultMessage('This punch card reward has been marked as redeemed.');
        } else {
          setOutcome('rejected');
          setResultMessage(result.reason);
        }
      } catch {
        setOutcome('rejected');
        setResultMessage(
          'We could not verify that code. Please check your connection and try again.',
        );
      }
      setStage('result');
    },
    [verifyRedemptionQr],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        {stage === 'scanning' && (
          <QrScannerView onScanned={handleScanned} onClose={handleClose} />
        )}
        {stage === 'processing' && (
          <VerificationProcessingView
            title="Verifying code…"
            body="Checking this code against the venue's records."
          />
        )}
        {stage === 'result' && (
          <QrRedemptionResultView
            outcome={outcome}
            message={resultMessage}
            onScanAnother={reset}
            onDone={handleClose}
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
