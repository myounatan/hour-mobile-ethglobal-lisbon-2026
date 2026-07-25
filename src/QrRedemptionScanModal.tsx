import { useCallback, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { isForVenue, parseRedemptionPayload, redemptionRefusalCopy } from './redemption';
import { PUNCH_CARD_SURFACE } from './theme';
import type { QrRedemptionVerificationResult } from './types';
import { QrRedemptionResultView } from './QrRedemptionResultView';
import { QrScannerView } from './QrScannerView';
import { VerificationProcessingView } from './VerificationProcessingView';

type Stage = 'scanning' | 'processing' | 'result';

const NOT_OUR_CODE =
  'That is not an Hour redemption code. Ask the customer to open their punch card and tap "Show QR code".';

type QrRedemptionScanModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  /** The venue whose staff are scanning — a code for anywhere else is turned away here. */
  expectedVenueId: string;
  /** Submits the scanned code for redemption and resolves with the outcome. */
  verifyRedemptionQr: (
    qrData: string,
  ) => Promise<QrRedemptionVerificationResult>;
  /** Called after a code has been honoured, e.g. to refresh the venue's own screen. */
  onRedeemed?: () => void;
};

/**
 * Full-screen flow started from the venue owner's "Scan QR Code" menu item: scan a customer's
 * redemption code, submit it, then show whether it was honoured.
 *
 * A code that isn't ours, or belongs to another venue, is refused right here — both are legible
 * from the payload itself (see `./redemption`), and there is no sense uploading a code we can
 * already see this venue cannot honour. Everything else is the server's call.
 */
export function QrRedemptionScanModal({
  visible,
  onRequestClose,
  expectedVenueId,
  verifyRedemptionQr,
  onRedeemed,
}: QrRedemptionScanModalProps) {
  const [stage, setStage] = useState<Stage>('scanning');
  const [outcome, setOutcome] = useState<'approved' | 'rejected'>('approved');
  const [resultMessage, setResultMessage] = useState('');
  const [reward, setReward] = useState<string | undefined>(undefined);

  const reset = useCallback(() => {
    setStage('scanning');
    setResultMessage('');
    setReward(undefined);
  }, []);

  const handleClose = useCallback(() => {
    onRequestClose();
    reset();
  }, [onRequestClose, reset]);

  const refuse = useCallback((message: string) => {
    setOutcome('rejected');
    setResultMessage(message);
    setStage('result');
  }, []);

  const handleScanned = useCallback(
    async (qrData: string) => {
      const scanned = parseRedemptionPayload(qrData);
      if (!scanned) {
        refuse(NOT_OUR_CODE);
        return;
      }
      if (!isForVenue(scanned, expectedVenueId)) {
        refuse(redemptionRefusalCopy('wrong_venue'));
        return;
      }

      setStage('processing');
      try {
        const result = await verifyRedemptionQr(qrData);
        if (!result.approved) {
          refuse(result.reason);
          return;
        }
        setOutcome('approved');
        setResultMessage('This punch card has been marked as redeemed.');
        setReward(result.rewardDescription);
        setStage('result');
        onRedeemed?.();
      } catch {
        refuse(
          'We could not verify that code. Please check your connection and try again.',
        );
      }
    },
    [expectedVenueId, onRedeemed, refuse, verifyRedemptionQr],
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
            rewardDescription={reward}
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
