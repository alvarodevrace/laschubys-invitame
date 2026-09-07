/**
 * Visual palette for the collaboration tier cards.
 * Follows the Las Chubys design system: cards use `rounded-[2.5rem]`, an inner
 * block `rounded-[1.75rem]`, and brand accent colors (see Design-System.md §2/§5).
 */
export interface TierVisual {
  /** Background of the decorative circle and the inner name/price block. */
  card: string;
  /** Background of the whole card. */
  light: string;
  /** Accent (badges, icons, price). */
  accent: string;
  /** Text on the card / inner block. */
  text: string;
}

export const tierPalette: readonly TierVisual[] = [
  {
    card: 'var(--color-iris-bg)',
    light: 'var(--color-surface)',
    accent: 'var(--color-iris)',
    text: 'var(--color-iris-text)',
  },
  {
    card: 'var(--color-rubi-bg)',
    light: 'var(--color-surface)',
    accent: 'var(--color-rubi)',
    text: 'var(--color-rubi-text)',
  },
  {
    card: 'var(--color-human-bg)',
    light: 'var(--color-surface)',
    accent: 'var(--color-human)',
    text: 'var(--color-human-text)',
  },
] as const;

/** Stable color per tier key (e.g. 'croqueta', 'churu', 'salmon'). */
export function tierColor(key: string): TierVisual {
  const idx = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return tierPalette[idx % tierPalette.length];
}
