import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, S } from './theme';
import { type ProgressStage, useStagedProgress } from './useStagedProgress';

type VerificationProcessingViewProps = {
  title?: string;
  body?: string;
  /** Walk these steps under a filling bar instead of showing a static `body`. */
  stages?: ProgressStage[];
};

/** Shown while a captured photo or scanned code is submitted for verification. */
export function VerificationProcessingView({
  title = 'Verifying your receipt…',
  body = 'This only takes a moment.',
  stages,
}: VerificationProcessingViewProps) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={onCard(0.9)} />
      <Text style={styles.title}>{title}</Text>
      {stages && stages.length > 0 ? (
        <StagedProgress stages={stages} />
      ) : (
        <Text style={styles.body}>{body}</Text>
      )}
    </View>
  );
}

function StagedProgress({ stages }: { stages: ProgressStage[] }) {
  const { label, progress } = useStagedProgress(stages);
  return (
    <View style={styles.progress}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.body}>{label}</Text>
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
  progress: {
    alignItems: 'center',
    gap: S.sm,
    marginTop: S.xxs,
    width: '100%',
  },
  track: {
    width: 220,
    maxWidth: '80%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: onCard(0.15),
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PUNCH_CARD_ACCENT,
  },
});
