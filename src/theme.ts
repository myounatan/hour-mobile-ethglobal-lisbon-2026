/**
 * Design tokens the rewards UI needs, declared here so the package carries no
 * dependency on a host app's theme. Override nothing, or wrap the components and
 * restyle around them.
 */
export const REWARD_COLORS = {
  navy: '#272838',
  pink: '#E16F7C',
  danger: '#E2574C',
  label2: 'rgba(39,40,56,1)',
  label3: 'rgba(79,80,96,1)',
  label4: 'rgba(240,240,240,1)',
} as const;

/** Spacing tokens — multiples of 4 for layout rhythm. */
export const S = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/** Dark "physical card" surface the punch grid sits on. */
export const PUNCH_CARD_SURFACE = REWARD_COLORS.navy;
export const PUNCH_CARD_ACCENT = REWARD_COLORS.pink;

/** Text/borders drawn on top of the dark surface. */
export function onCard(alpha: number): string {
  return `rgba(247,248,252,${alpha})`;
}

export function accentAlpha(alpha: number): string {
  return `rgba(225,111,124,${alpha})`;
}
