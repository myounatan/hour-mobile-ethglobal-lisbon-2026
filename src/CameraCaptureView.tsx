import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CameraPermissionGate } from './CameraPermissionGate';
import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, S } from './theme';

type CameraCaptureViewProps = {
  onCapture: (photoUri: string) => void;
  onClose: () => void;
};

/** Full-screen viewfinder with a shutter button, used to photograph a receipt. */
export function CameraCaptureView({ onCapture, onClose }: CameraCaptureViewProps) {
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
        message="Hour needs your camera to scan the receipt for this punch."
        canAskAgain={permission?.canAskAgain ?? true}
        onRequest={requestPermission}
        onClose={onClose}
      />
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
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
        <Text style={styles.hint}>Line up the receipt inside the frame</Text>
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
    borderColor: onCard(0.5),
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
    paddingBottom: S.xxl,
    paddingTop: S.xl,
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    color: onCard(0.85),
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
