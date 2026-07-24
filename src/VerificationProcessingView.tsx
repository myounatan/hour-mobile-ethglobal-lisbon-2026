import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { onCard, PUNCH_CARD_SURFACE, S } from './theme';

type VerificationProcessingViewProps = {
  title?: string;
  body?: string;
};

/** Shown while a captured photo or scanned code is submitted for verification. */
export function VerificationProcessingView({
  title = 'Verifying your receipt…',
  body = 'This only takes a moment.',
}: VerificationProcessingViewProps) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={onCard(0.9)} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
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
  title: {
    marginTop: S.sm,
    fontSize: 16,
    fontWeight: '600',
    color: onCard(1),
  },
  body: {
    fontSize: 13,
    color: onCard(0.6),
  },
});
