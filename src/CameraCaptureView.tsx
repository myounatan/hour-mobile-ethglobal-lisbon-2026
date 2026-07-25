import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPermissionGate } from './CameraPermissionGate';
import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, S } from './theme';

/** Vertical space reserved for hint + shutter row so the frame clears the controls. */
const FOOTER_CONTENT_HEIGHT = 168;

type CameraCaptureViewProps = {
  onCapture: (photoUri: string) => void;
  onClose: () => void;
};

/** Full-screen viewfinder with a shutter button, used to photograph a receipt. */
export function CameraCaptureView({ onCapture, onClose }: CameraCaptureViewProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleShutterPress = async () => {
    if (isCapturing || !cameraRef.current) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission || !permission.granted) {
    return (
      <CameraPermissionGate
        message="Hour needs your camera to scan the receipt for this star."
        canAskAgain={permission?.canAskAgain ?? true}
        onRequest={requestPermission}
        onClose={onClose}
      />
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View
        style={[
          styles.frame,
          {
            top: insets.top + S.xxl,
            bottom: insets.bottom + FOOTER_CONTENT_HEIGHT,
            left: S.xxl,
            right: S.xxl,
          },
        ]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, S.sm) + S.xxl },
        ]}
      >
        <Text style={styles.hint}>Line up the receipt inside the frame</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={8}
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shutter}
            onPress={handleShutterPress}
            activeOpacity={0.85}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color={PUNCH_CARD_SURFACE} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
          {/* Balances the close button so the shutter stays centered */}
          <View style={styles.closeButtonSpacer} />
        </View>
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
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: onCard(0.5),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: S.lg,
    paddingTop: S.xl,
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    color: onCard(0.85),
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xxl,
    width: '100%',
    paddingHorizontal: S.xxl,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButtonSpacer: {
    width: 48,
    height: 48,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: onCard(1),
    borderWidth: 4,
    borderColor: onCard(0.35),
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PUNCH_CARD_ACCENT,
  },
});
