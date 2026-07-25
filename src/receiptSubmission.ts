/**
 * The wire side of a punch: what a captured photo is sent as, and what comes back.
 *
 * A host owns its API client -- base URL, auth, refresh, timeouts -- so this package does not
 * make the request. It owns everything either side of it: the multipart body the endpoint
 * expects, the shape of the verdict, and the words a refusal is shown in. That keeps a host's
 * `verifyPunch` (see `PunchCameraModal`) down to one call and one mapping.
 *
 * Mirrors `ReceiptSubmissionResponse` in the companion `hour-rewards-sdk` package.
 */
import type { PunchVerificationResult } from './types';

/** A card's progress *after* a submission, so an approval needn't be re-fetched. */
export type ReceiptVerdictSummary = {
  venue_id: string;
  punches_earned: number;
  punches_required: number;
  reward_description: string;
  hedera_token_id?: string | null;
  hedera_nft_serial?: number | null;
  hedera_explorer_url?: string | null;
};

/** What came of a photographed receipt: a punch, or a refusal with a reason. */
export type ReceiptVerdict = {
  approved: boolean;
  status: 'verified' | 'rejected';
  /** A code from the verifier's own vocabulary, e.g. `venue_mismatch`, when refused. */
  reason?: string | null;
  punch_event_id?: string | null;
  confidence?: number | null;
  summary?: ReceiptVerdictSummary | null;
  /** The attested 0G inference that judged the receipt, and where the punch landed. */
  zg_request_id?: string | null;
  zg_tee_verified?: boolean | null;
  hedera_topic_sequence_number?: number | null;
  hedera_consensus_timestamp?: string | null;
};

const GENERIC_REFUSAL =
  'We could not confirm that receipt. Try again with a clear photo of the whole thing.';

/** Each refusal code in words a customer can act on, since a code helps nobody at the till. */
const REFUSAL_COPY: Record<string, string> = {
  not_a_receipt:
    'That does not look like a receipt. Photograph the receipt itself, bill total and all.',
  venue_mismatch:
    'That receipt is from somewhere else, so it cannot earn a star here.',
  no_total:
    'We could not find a total. Make sure the bottom of the receipt is in frame.',
  no_date: 'We could not find a date. Make sure the top of the receipt is in frame.',
  illegible:
    'That photo was too hard to read. Try again in better light, holding still.',
  duplicate_receipt: 'That receipt has already earned a star here.',
  low_confidence: GENERIC_REFUSAL,
  verifier_unavailable:
    'Receipt checks are unavailable right now. Please try again in a moment.',
};

/** The body the receipts endpoint expects: the photo itself, as `multipart/form-data`. */
export function receiptPhotoFormData(photoUri: string): FormData {
  const form = new FormData();
  // React Native's FormData takes a file by URI, which its types don't describe.
  form.append('file', {
    uri: photoUri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  return form;
}

/** Turn a verdict into what `PunchCameraModal` shows, refusal codes translated. */
export function punchResultFromVerdict(
  verdict: ReceiptVerdict,
): PunchVerificationResult {
  if (verdict.approved) return { approved: true };
  return {
    approved: false,
    reason:
      (verdict.reason ? REFUSAL_COPY[verdict.reason] : undefined) ??
      GENERIC_REFUSAL,
  };
}
