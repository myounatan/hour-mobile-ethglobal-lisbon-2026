import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PROOF_EVENT_LABELS,
  PROOF_STATUS_LABELS,
  rewardProofFromInput,
  type RewardProof,
  type RewardProofInput,
} from './proof';
import { onCard, PUNCH_CARD_ACCENT, PUNCH_CARD_SURFACE, REWARD_COLORS, S } from './theme';

type RewardProofModalProps = {
  visible: boolean;
  eventId: string | null;
  onRequestClose: () => void;
  /** Fetches proof only when the customer opens a history event. */
  fetchProof: (eventId: string) => Promise<RewardProofInput>;
};

type Stage = 'loading' | 'ready' | 'error';

const LOAD_ERROR = 'We could not load this proof. Check your connection and try again.';

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function openExternal(url: string): void {
  void Linking.openURL(url).catch(() => undefined);
}

function DetailRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueWrap}>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
        {onPress ? <ExternalLink size={15} color={onCard(0.55)} /> : null}
      </View>
    </>
  );

  return onPress ? (
    <TouchableOpacity style={styles.detailRow} onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={styles.detailRow}>{content}</View>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function ProofDetailView({ proof, onClose }: { proof: RewardProof; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { hedera, receipt, redemption, zg } = proof;
  const hasLedger =
    hedera.topicId != null ||
    hedera.topicSequenceNumber != null ||
    hedera.consensusTimestamp != null ||
    hedera.tokenId != null ||
    hedera.nftSerial != null;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, S.lg) }]}>
        <TouchableOpacity
          accessibilityLabel="Close proof details"
          hitSlop={12}
          onPress={onClose}
        >
          <X size={24} color={onCard(0.9)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section icon={<FileCheck2 size={20} color={PUNCH_CARD_ACCENT} />} title="Event">
          <DetailRow label="Type" value={PROOF_EVENT_LABELS[proof.type]} />
          <DetailRow label="Recorded" value={formatDate(proof.occurredAt)} />
          <DetailRow label="Card cycle" value={String(proof.cycleNumber)} />
          <DetailRow label="Event ID" value={proof.id} />
        </Section>

        {receipt ? (
          <Section icon={<FileCheck2 size={20} color={PUNCH_CARD_ACCENT} />} title="Receipt verification">
            <DetailRow label="Status" value={PROOF_STATUS_LABELS[receipt.status]} />
            {receipt.receiptIdentifier ? (
              <DetailRow label="Receipt" value={receipt.receiptIdentifier} />
            ) : null}
            {receipt.receiptDate ? (
              <DetailRow label="Receipt date" value={receipt.receiptDate} />
            ) : null}
            {receipt.receiptTotalAmount != null ? (
              <DetailRow label="Receipt total" value={String(receipt.receiptTotalAmount)} />
            ) : null}
            {receipt.aiConfidenceScore != null ? (
              <DetailRow
                label="AI confidence"
                value={`${Math.round(receipt.aiConfidenceScore * 100)}%`}
              />
            ) : null}
          </Section>
        ) : null}

        {zg ? (
          <Section icon={<ShieldCheck size={20} color={PUNCH_CARD_ACCENT} />} title="0G attestation">
            {zg.requestId ? <DetailRow label="Request ID" value={zg.requestId} /> : null}
            {zg.providerAddress ? <DetailRow label="Provider" value={zg.providerAddress} /> : null}
            {zg.teeVerified != null ? (
              <DetailRow label="Stored TEE result" value={zg.teeVerified ? 'Verified' : 'Not verified'} />
            ) : null}
            {zg.teeVerifiedLive != null ? (
              <DetailRow label="Live TEE result" value={zg.teeVerifiedLive ? 'Verified' : 'Not verified'} />
            ) : null}
            {zg.signingAddress ? <DetailRow label="Signing address" value={zg.signingAddress} /> : null}
            {zg.enclaveSigner ? <DetailRow label="Enclave signer" value={zg.enclaveSigner} /> : null}
            {zg.signatureUrl ? (
              <DetailRow
                label="Attestation"
                value="View public signature"
                onPress={() => openExternal(zg.signatureUrl ?? '')}
              />
            ) : null}
            {zg.error ? <DetailRow label="Live check" value={zg.error} /> : null}
          </Section>
        ) : null}

        {hasLedger ? (
          <Section icon={<CheckCircle2 size={20} color={PUNCH_CARD_ACCENT} />} title="Public ledger">
            {hedera.network ? <DetailRow label="Network" value={hedera.network} /> : null}
            {hedera.topicId ? (
              <DetailRow
                label="Topic"
                value={hedera.topicId}
                onPress={hedera.topicUrl ? () => openExternal(hedera.topicUrl ?? '') : undefined}
              />
            ) : null}
            {hedera.topicSequenceNumber != null ? (
              <DetailRow
                label="Topic sequence"
                value={String(hedera.topicSequenceNumber)}
              />
            ) : null}
            {hedera.consensusTimestamp ? (
              <DetailRow label="Consensus time" value={hedera.consensusTimestamp} />
            ) : null}
            {hedera.tokenId && hedera.nftSerial != null ? (
              <DetailRow
                label="Punch card NFT"
                value={`${hedera.tokenId} #${hedera.nftSerial}`}
                onPress={hedera.nftUrl ? () => openExternal(hedera.nftUrl ?? '') : undefined}
              />
            ) : null}
            {hedera.metadataTransactionId ? (
              <DetailRow
                label="Metadata update"
                value={hedera.metadataTransactionId}
                onPress={
                  hedera.metadataTransactionUrl
                    ? () => openExternal(hedera.metadataTransactionUrl ?? '')
                    : undefined
                }
              />
            ) : null}
            {hedera.nftAccountId ? (
              <DetailRow
                label="NFT account"
                value={hedera.nftAccountId}
                onPress={hedera.accountUrl ? () => openExternal(hedera.accountUrl ?? '') : undefined}
              />
            ) : null}
            {hedera.mirrorNodeUrl ? (
              <DetailRow
                label="Mirror record"
                value="View topic message"
                onPress={() => openExternal(hedera.mirrorNodeUrl ?? '')}
              />
            ) : null}
            {hedera.messageError ? <DetailRow label="Mirror check" value={hedera.messageError} /> : null}
          </Section>
        ) : null}

        {hedera.message ? (
          <Section icon={<CheckCircle2 size={20} color={PUNCH_CARD_ACCENT} />} title="On-chain message">
            <Text selectable style={styles.rawMessage}>
              {JSON.stringify(hedera.message, null, 2)}
            </Text>
            {hedera.mirrorNodeUrl ? (
              <DetailRow
                label="Mirror record"
                value="View topic message"
                onPress={() => openExternal(hedera.mirrorNodeUrl ?? '')}
              />
            ) : null}
          </Section>
        ) : null}

        {redemption ? (
          <Section icon={<CheckCircle2 size={20} color={PUNCH_CARD_ACCENT} />} title="Reward redeemed">
            <DetailRow label="Reward" value={redemption.rewardDescription} />
            <DetailRow label="Punches required" value={String(redemption.punchesRequired)} />
          </Section>
        ) : null}

        <Text style={styles.privacyNote}>
          Your receipt image is not stored. This shows the verification and public-ledger
          references available for this event.
        </Text>
      </ScrollView>
    </View>
  );
}

function LoadingView() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={onCard(0.9)} />
      <Text style={styles.loadingTitle}>Loading proof…</Text>
      <Text style={styles.loadingBody}>Checking the event record.</Text>
    </View>
  );
}

function ErrorView({ onRetry, onClose }: { onRetry: () => void; onClose: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>Could not load proof</Text>
      <Text style={styles.loadingBody}>{LOAD_ERROR}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.retryLabel}>Try again</Text>
        <ChevronRight size={18} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeLabel}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Fetches and displays the independently checkable record behind one reward event. */
export function RewardProofModal({
  visible,
  eventId,
  onRequestClose,
  fetchProof,
}: RewardProofModalProps) {
  const [stage, setStage] = useState<Stage>('loading');
  const [proof, setProof] = useState<RewardProof | null>(null);

  const load = useCallback(async () => {
    if (!eventId) return;
    setStage('loading');
    try {
      setProof(rewardProofFromInput(await fetchProof(eventId)));
      setStage('ready');
    } catch {
      setStage('error');
    }
  }, [eventId, fetchProof]);

  useEffect(() => {
    if (!visible || !eventId) return;
    void load();
  }, [eventId, load, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}
    >
      {stage === 'loading' ? <LoadingView /> : null}
      {stage === 'ready' && proof ? <ProofDetailView proof={proof} onClose={onRequestClose} /> : null}
      {stage === 'error' ? <ErrorView onRetry={load} onClose={onRequestClose} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PUNCH_CARD_SURFACE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingBottom: S.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: onCard(0.15),
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: onCard(1),
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    gap: S.md,
    padding: S.lg,
    paddingBottom: S.xxl,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: onCard(0.08),
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
    padding: S.md,
    paddingBottom: S.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: onCard(1),
  },
  sectionContent: {
    paddingHorizontal: S.md,
    paddingBottom: S.xxs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
    paddingVertical: S.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: onCard(0.12),
  },
  detailLabel: {
    flexShrink: 0,
    fontSize: 13,
    color: onCard(0.6),
  },
  detailValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: S.xs,
  },
  detailValue: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    color: onCard(0.92),
  },
  rawMessage: {
    paddingVertical: S.sm,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 17,
    color: onCard(0.85),
  },
  privacyNote: {
    paddingHorizontal: S.sm,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: onCard(0.55),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.xs,
    padding: S.xl,
    backgroundColor: PUNCH_CARD_SURFACE,
  },
  loadingTitle: {
    marginTop: S.sm,
    fontSize: 16,
    fontWeight: '600',
    color: onCard(1),
  },
  loadingBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: onCard(0.65),
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: onCard(1),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
    marginTop: S.lg,
    minHeight: 48,
    paddingHorizontal: S.lg,
    borderRadius: 100,
    backgroundColor: REWARD_COLORS.danger,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  closeLabel: {
    marginTop: S.md,
    fontSize: 14,
    fontWeight: '500',
    color: onCard(0.6),
  },
});
