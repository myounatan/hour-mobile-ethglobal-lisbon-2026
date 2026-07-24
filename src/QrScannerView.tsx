import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CameraPermissionGate } from './CameraPermissionGate';
import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, S } from './theme';

type QrScannerViewProps = {
  onScanned: (data: string) => void;
  onClose: () => void;
};

/** Full-screen viewfinder that continuously scans for a QR code. */
export function QrScannerView({ onScanned, onClose }: QrScannerViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  // Guards against the scanner firing repeatedly for the same code while the
  // parent is still transitioning away from this view.
  const hasScannedRef = useRef(false);

  const handleBarcodeScanned = (result: { data: string }) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    onScanned(result.data);
  };

  if (!permission || !permission.granted) {
    return (
      <CameraPermissionGate
        message="Hour needs your camera to scan the customer's redemption code."
        canAskAgain={permission?.canAskAgain ?? true}
        onRequest={requestPermission}
        onClose={onClose}
      />
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.frame} pointerEvents="none" />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.8}
        hitSlop={8}
      >
        <X size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          Point the camera at the customer's redemption code
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PUNCH_CARD_SURFACE,
  },
  camera: {
    flex: 1,
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: S.xxl,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PUNCH_CARD_ACCENT,
  },
  closeButton: {
    position: 'absolute',
    top: S.xl,
    right: S.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: S.lg,
    paddingHorizontal: S.xl,
    paddingBottom: S.xxl,
    paddingTop: S.xl,
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: onCard(0.85),
  },
});
