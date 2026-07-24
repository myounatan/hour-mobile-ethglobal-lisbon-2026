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
