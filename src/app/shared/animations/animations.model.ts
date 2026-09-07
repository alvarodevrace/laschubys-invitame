export type EasingDefinition =
  | [number, number, number, number]
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'circIn'
  | 'circOut'
  | 'backIn'
  | 'backOut'
  | 'anticipate';

export interface ScrollRevealOptions {
  /** Duration in seconds. */
  duration?: number;
  /** Delay in seconds. */
  delay?: number;
  /** Vertical offset in px before animation. */
  y?: number;
  /** Horizontal offset in px before animation. */
  x?: number;
  /** Initial scale. */
  scale?: number;
  /** Initial opacity. */
  opacity?: number;
  /** Easing curve. */
  easing?: EasingDefinition;
  /** Whether the animation should run only once. */
  once?: boolean;
  /** Amount of element that must be visible to trigger. */
  amount?: 'some' | 'all' | number;
}

export interface ParallaxOptions {
  /** Negative values move slower/up, positive moves faster/down. */
  speed?: number;
  /** Axis of parallax movement. */
  axis?: 'x' | 'y';
}

export interface StaggerOptions {
  /** Delay between children in seconds. */
  staggerDelay?: number;
  /** CSS selector for children to animate. Defaults to direct children. */
  childSelector?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** Vertical offset in px. */
  y?: number;
  /** Initial opacity. */
  opacity?: number;
}

export interface TiltOptions {
  /** Maximum rotation in degrees. */
  max?: number;
  /** CSS perspective in px. */
  perspective?: number;
  /** Scale on hover. */
  scale?: number;
  /** Disable tilt (e.g. on touch devices). */
  disabled?: boolean;
}

export interface TextRevealOptions {
  /** Split by 'word' or 'line'. */
  splitBy?: 'word' | 'line';
  /** Duration in seconds. */
  duration?: number;
  /** Delay between words/lines in seconds. */
  staggerDelay?: number;
  /** Vertical offset in px. */
  y?: number;
}
