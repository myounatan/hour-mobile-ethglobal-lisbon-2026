import type { RewardHistoryEventType } from './types';

export type HederaProofResponse = {
  network?: string | null;
  topic_id?: string | null;
  topic_sequence_number?: number | null;
  consensus_timestamp?: string | null;
  metadata_transaction_id?: string | null;
  token_id?: string | null;
  nft_serial?: number | null;
  nft_account_id?: string | null;
  topic_url?: string | null;
  nft_url?: string | null;
  metadata_transaction_url?: string | null;
  account_url?: string | null;
  message?: Record<string, unknown> | null;
  mirror_node_url?: string | null;
  message_error?: string | null;
};

export type ZgProofResponse = {
  request_id?: string | null;
  provider_address?: string | null;
  tee_verified?: boolean | null;
  signing_address?: string | null;
  enclave_signer?: string | null;
  tee_verified_live?: boolean | null;
  signature?: string | null;
  signature_url?: string | null;
  error?: string | null;
};

export type ReceiptProofResponse = {
  dedupe_hash: string;
  receipt_identifier?: string | null;
  receipt_date?: string | null;
  receipt_total_amount?: number | null;
  ai_confidence_score?: number | null;
  status: 'verified' | 'rejected';
};

export type RedemptionProofResponse = {
  reward_description: string;
  punches_required: number;
  cycle_number: number;
};

/** Exact wire shape returned by the reward-event proof endpoint. */
export type RewardProofResponse = {
  id: string;
  type: RewardHistoryEventType;
  occurred_at: string;
  cycle_number: number;
  hedera: HederaProofResponse;
  zg?: ZgProofResponse | null;
  receipt?: ReceiptProofResponse | null;
  redemption?: RedemptionProofResponse | null;
};

/** UI-friendly proof data. Hosts can map API responses with `rewardProofFromResponse`. */
export type RewardProof = {
  id: string;
  type: RewardHistoryEventType;
  occurredAt: string;
  cycleNumber: number;
  hedera: {
    network?: string | null;
    topicId?: string | null;
    topicSequenceNumber?: number | null;
    consensusTimestamp?: string | null;
    metadataTransactionId?: string | null;
    tokenId?: string | null;
    nftSerial?: number | null;
    nftAccountId?: string | null;
    topicUrl?: string | null;
    nftUrl?: string | null;
    metadataTransactionUrl?: string | null;
    accountUrl?: string | null;
    message?: Record<string, unknown> | null;
    mirrorNodeUrl?: string | null;
    messageError?: string | null;
  };
  zg?: {
    requestId?: string | null;
    providerAddress?: string | null;
    teeVerified?: boolean | null;
    signingAddress?: string | null;
    enclaveSigner?: string | null;
    teeVerifiedLive?: boolean | null;
    signature?: string | null;
    signatureUrl?: string | null;
    error?: string | null;
  } | null;
  receipt?: {
    dedupeHash: string;
    receiptIdentifier?: string | null;
    receiptDate?: string | null;
    receiptTotalAmount?: number | null;
    aiConfidenceScore?: number | null;
    status: 'verified' | 'rejected';
  } | null;
  redemption?: {
    rewardDescription: string;
    punchesRequired: number;
    cycleNumber: number;
  } | null;
};

export type RewardProofInput = RewardProof | RewardProofResponse;

export const PROOF_EVENT_LABELS: Record<RewardHistoryEventType, string> = {
  punch: 'Punch card event',
  redeem: 'Redeem event',
};

export const PROOF_STATUS_LABELS: Record<ReceiptProofResponse['status'], string> = {
  verified: 'Verified',
  rejected: 'Not verified',
};

/** Converts the API's snake_case proof response into the public UI model. */
export function rewardProofFromResponse(response: RewardProofResponse): RewardProof {
  return {
    id: response.id,
    type: response.type,
    occurredAt: response.occurred_at,
    cycleNumber: response.cycle_number,
    hedera: {
      network: response.hedera.network,
      topicId: response.hedera.topic_id,
      topicSequenceNumber: response.hedera.topic_sequence_number,
      consensusTimestamp: response.hedera.consensus_timestamp,
      metadataTransactionId: response.hedera.metadata_transaction_id,
      tokenId: response.hedera.token_id,
      nftSerial: response.hedera.nft_serial,
      nftAccountId: response.hedera.nft_account_id,
      topicUrl: response.hedera.topic_url,
      nftUrl: response.hedera.nft_url,
      metadataTransactionUrl: response.hedera.metadata_transaction_url,
      accountUrl: response.hedera.account_url,
      message: response.hedera.message,
      mirrorNodeUrl: response.hedera.mirror_node_url,
      messageError: response.hedera.message_error,
    },
    zg: response.zg
      ? {
          requestId: response.zg.request_id,
          providerAddress: response.zg.provider_address,
          teeVerified: response.zg.tee_verified,
          signingAddress: response.zg.signing_address,
          enclaveSigner: response.zg.enclave_signer,
          teeVerifiedLive: response.zg.tee_verified_live,
          signature: response.zg.signature,
          signatureUrl: response.zg.signature_url,
          error: response.zg.error,
        }
      : null,
    receipt: response.receipt
      ? {
          dedupeHash: response.receipt.dedupe_hash,
          receiptIdentifier: response.receipt.receipt_identifier,
          receiptDate: response.receipt.receipt_date,
          receiptTotalAmount: response.receipt.receipt_total_amount,
          aiConfidenceScore: response.receipt.ai_confidence_score,
          status: response.receipt.status,
        }
      : null,
    redemption: response.redemption
      ? {
          rewardDescription: response.redemption.reward_description,
          punchesRequired: response.redemption.punches_required,
          cycleNumber: response.redemption.cycle_number,
        }
      : null,
  };
}

export function isRewardProof(value: RewardProofInput): value is RewardProof {
  return 'occurredAt' in value;
}

/** Accept either public camelCase data or the backend's snake_case response. */
export function rewardProofFromInput(value: RewardProofInput): RewardProof {
  return isRewardProof(value) ? value : rewardProofFromResponse(value);
}
