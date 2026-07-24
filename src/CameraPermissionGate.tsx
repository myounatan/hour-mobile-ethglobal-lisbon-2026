import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, S } from './theme';

type CameraPermissionGateProps = {
  message: string;
  /** False once the user has permanently denied access — hides the retry button. */
  canAskAgain: boolean;
  onRequest: () => void;
  onClose: () => void;
};

/** Shown in place of the camera preview until access is granted or the user backs out. */
export function CameraPermissionGate({
  message,
  canAskAgain,
  onRequest,
  onClose,
}: CameraPermissionGateProps) {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Camera access needed</Text>
      <Text style={styles.body}>{message}</Text>
      {canAskAgain && (
        <TouchableOpacity style={styles.button} onPress={onRequest} activeOpacity={0.85}>
          <Text style={styles.buttonLabel}>Enable camera</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.cancel}>{canAskAgain ? 'Cancel' : 'Close'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    padding: S.xl,
    backgroundColor: PUNCH_CARD_SURFACE,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: onCard(1),
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: onCard(0.7),
  },
  button: {
    marginTop: S.sm,
    minHeight: 48,
    minWidth: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PUNCH_CARD_ACCENT,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  cancel: {
    marginTop: S.xs,
    fontSize: 14,
    fontWeight: '500',
    color: onCard(0.6),
  },
});
