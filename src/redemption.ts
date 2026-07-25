/**
 * The wire side of a redemption: what a QR code says, and what scanning one comes back as.
 *
 * A host owns its API client, so this package does not make the request. It owns everything
 * either side of it: the format the code is written in, the shapes the endpoints speak, and the
 * words a refusal is shown in.
 *
 * Mirrors `hour_rewards.redemption` in the companion `hour-rewards-sdk` package. The format is
 * written there and read here, which is the whole point of reading it here at all: a venue's
 * scanner can see that a code belongs to somewhere else and say so on the spot, instead of
 * uploading it and waiting to be told. The server checks the same thing again -- what a scanned
 * code claims about itself is never the reason anything is honoured.
 */
import type { QrRedemptionVerificationResult } from './types';

/** Bumped only when a payload stops being readable by the format below. */
export const REDEMPTION_PAYLOAD_VERSION = 1;

const PAYLOAD_PREFIX = 'hour://redeem/v';

export type RedemptionCodeStatus =
  | 'pending'
  | 'redeemed'
  | 'expired'
  | 'invalidated';

/** A code issued for a full card, as the redemption-codes endpoint returns it. */
export type RedemptionCodeResponse = {
  id: string;
  venue_id: string;
  punch_card_id: string;
  cycle_number: number;
  token: string;
  qr_payload: string;
  status: RedemptionCodeStatus;
  expires_at?: string | null;
  /** Seconds of life left when the response was sent; `-1` for a code with no deadline. */
  expires_in_seconds?: number;
};

/** A code as the UI holds it: the string to draw, and the moment it stops being good. */
export type RedemptionCode = {
  qrPayload: string;
  cycleNumber: number;
  /** A local `Date.now()` deadline, or `null` for a code that never expires. */
  expiresAt: number | null;
};

/** What a scanned code claims. Worth checking; worth nothing on its own. */
export type ScannedRedemption = {
  token: string;
  /** `null` for a bare token, which is what codes predating this format look like. */
  venueId: string | null;
  cycleNumber: number | null;
};

/** What came of a scan: a reward to hand over, or a refusal with a reason. */
export type RedemptionScanVerdict = {
  approved: boolean;
  /** A code from the SDK's own vocabulary, e.g. `wrong_venue`, when refused. */
  reason?: string | null;
  reward_description?: string | null;
};

const GENERIC_REFUSAL =
  'We could not redeem that code. Ask the customer to open their card again for a fresh one.';

/** Each refusal in words a staff member can act on, since a code helps nobody at the till. */
const REFUSAL_COPY: Record<string, string> = {
  wrong_venue: 'That code is for a different venue, so it cannot be redeemed here.',
  code_not_found: 'That code is not one of ours. Check they are showing the right screen.',
  code_expired:
    'That code has expired. Ask them to reopen their punch card for a new one.',
  already_redeemed: 'That reward has already been claimed.',
  stale_cycle:
    'That code is from a card that has already been redeemed — it may be a screenshot.',
  card_missing: 'That punch card no longer exists.',
  program_missing: 'This venue does not have a punch card running right now.',
};

/**
 * Turn the server's response into the code the UI counts down.
 *
 * The deadline is derived from the duration rather than read from `expires_at`, because that
 * column is naive UTC on the server: a client parsing it would have to guess a zone, and would
 * be counting against its own clock regardless. A duration is unambiguous either way.
 */
export function redemptionCodeFromResponse(
  response: RedemptionCodeResponse,
): RedemptionCode {
  const ttl = response.expires_in_seconds;
  return {
    qrPayload: response.qr_payload,
    cycleNumber: response.cycle_number,
    // A negative or absent duration is a code with no deadline, never one already dead.
    expiresAt:
      typeof ttl === 'number' && ttl >= 0 ? Date.now() + ttl * 1000 : null,
  };
}

/** The body the scan endpoint expects: the scanned string, exactly as the camera read it. */
export function redemptionScanBody(qrPayload: string): { qr_payload: string } {
  return { qr_payload: qrPayload };
}

/**
 * Read a scanned string, or `null` for anything that was never one of our codes.
 *
 * Anything without a scheme is taken to be a bare token, so older codes still scan. A payload
 * from a newer version of the format reads as unrecognisable rather than half-understood.
 */
export function parseRedemptionPayload(raw: string): ScannedRedemption | null {
  const text = (raw ?? '').trim();
  if (!text) return null;

  if (!text.includes('://')) {
    return { token: text, venueId: null, cycleNumber: null };
  }
  if (!text.startsWith(PAYLOAD_PREFIX)) return null;

  const [version = '', query = ''] = text
    .slice(PAYLOAD_PREFIX.length)
    .split('?', 2);
  if (!/^\d+$/.test(version) || Number(version) > REDEMPTION_PAYLOAD_VERSION) {
    return null;
  }
  if (!query) return null;

  const fields = parseQuery(query);
  const token = fields.token?.trim();
  if (!token) return null;

  const cycle = Number(fields.cycle);
  return {
    token,
    venueId: fields.venue ?? null,
    cycleNumber: Number.isFinite(cycle) && fields.cycle ? cycle : null,
  };
}

/** Whether a scanned code belongs to the venue whose staff just scanned it. */
export function isForVenue(
  scanned: ScannedRedemption,
  venueId: string,
): boolean {
  // A bare token names no venue, so there is nothing to disagree with here; the server still
  // checks the card's own venue before honouring it.
  if (scanned.venueId === null) return true;
  return scanned.venueId.toLowerCase() === venueId.toLowerCase();
}

/** Turn a scan verdict into what `QrRedemptionScanModal` shows, refusal codes translated. */
export function redemptionResultFromVerdict(
  verdict: RedemptionScanVerdict,
): QrRedemptionVerificationResult {
  if (verdict.approved) {
    return {
      approved: true,
      rewardDescription: verdict.reward_description ?? undefined,
    };
  }
  return {
    approved: false,
    reason:
      (verdict.reason ? REFUSAL_COPY[verdict.reason] : undefined) ??
      GENERIC_REFUSAL,
  };
}

/** The words for a refusal the scanner reached on its own, without asking the server. */
export function redemptionRefusalCopy(reason: string): string {
  return REFUSAL_COPY[reason] ?? GENERIC_REFUSAL;
}

// Hermes' `URL` support is partial, and the format is two levels of simple, so this stays hand
// rolled rather than pulling in a polyfill.
function parseQuery(query: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const pair of query.split('&')) {
    const separator = pair.indexOf('=');
    if (separator <= 0) continue;
    fields[pair.slice(0, separator)] = decode(pair.slice(separator + 1));
  }
  return fields;
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
