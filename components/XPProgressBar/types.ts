export interface XPProgressBarProps {
  /** Current XP value */
  current: number;
  /** Maximum XP needed for next level */
  max: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show XP numbers label */
  showLabel?: boolean;
  /** Trigger pulse animation (on XP gain) */
  triggerPulse?: boolean;
  /** Custom className */
  className?: string;
}