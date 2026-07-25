import { useCallback, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { CameraCaptureView } from './CameraCaptureView';
import { PunchRejectedView } from './PunchRejectedView';
import { PUNCH_CARD_SURFACE } from './theme';
import { VerificationProcessingView } from './VerificationProcessingView';
import type { ProgressStage } from './useStagedProgress';
import type { PunchVerificationResult } from './types';

type Stage = 'capture' | 'processing' | 'rejected';

/** Roughly what a verification spends its time on: upload, then OCR, then the verdict. */
const PROCESSING_STAGES: ProgressStage[] = [
  { label: 'Uploading your photo…', durationMs: 3000 },
  { label: 'Reading the receipt…', durationMs: 7000 },
  { label: 'Verifying it…', durationMs: 8000 },
];

type PunchCameraModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  /** Called once the pipeline approves the photo — play the punch/star animation here. */
  onApproved: () => void;
  /** Uploads the captured photo and resolves with the verification outcome. */
  verifyPunch: (photoUri: string) => Promise<PunchVerificationResult>;
};

/**
 * Full-screen flow started from the "Scan receipt for a star" button: capture a
 * photo of the receipt, submit it for verification, then either hand control
 * back to the host screen (approved) or explain why the star didn't go through.
 */
export function PunchCameraModal({
  visible,
  onRequestClose,
  onApproved,
  verifyPunch,
}: PunchCameraModalProps) {
  const [stage, setStage] = useState<Stage>('capture');
  const [rejectionReason, setRejectionReason] = useState('');

  const reset = useCallback(() => {
    setStage('capture');
    setRejectionReason('');
  }, []);

  const handleClose = useCallback(() => {
    onRequestClose();
    reset();
  }, [onRequestClose, reset]);

  const handleCapture = useCallback(
    async (photoUri: string) => {
      setStage('processing');
      try {
        const result = await verifyPunch(photoUri);
        if (result.approved) {
          onRequestClose();
          reset();
          onApproved();
        } else {
          setRejectionReason(result.reason);
          setStage('rejected');
        }
      } catch {
        setRejectionReason(
          'We could not verify that photo. Please check your connection and try again.',
        );
        setStage('rejected');
      }
    },
    [onApproved, onRequestClose, reset, verifyPunch],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        {stage === 'capture' && (
          <CameraCaptureView onCapture={handleCapture} onClose={handleClose} />
        )}
        {stage === 'processing' && (
          <VerificationProcessingView stages={PROCESSING_STAGES} />
        )}
        {stage === 'rejected' && (
          <PunchRejectedView
            reason={rejectionReason}
            onRetry={reset}
            onClose={handleClose}
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
