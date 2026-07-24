/** A user's progress on one venue's punch card. */
export type PunchCardSummary = {
  venueId: string;
  punchesEarned: number;
  punchesRequired: number;
  rewardDescription: string;
};

export type RewardHistoryEventType = 'punch' | 'redeem';

/** One entry in a card's timeline: a punch earned, or a reward claimed. */
export type RewardHistoryEvent = {
  id: string;
  type: RewardHistoryEventType;
  occurredAt: string;
};

export function isReadyToRedeem(summary: PunchCardSummary): boolean {
  return summary.punchesEarned >= summary.punchesRequired;
}

/** Outcome of running a captured punch photo through the verification pipeline. */
export type PunchVerificationResult =
  | { approved: true }
  | { approved: false; reason: string };

/** Outcome of running a scanned redemption QR code through the verification pipeline. */
export type QrRedemptionVerificationResult =
  | { approved: true }
  | { approved: false; reason: string };
