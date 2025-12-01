type BadgeSize = 'tiny' | 'small' | 'medium' | 'large';
type BadgeType = 'beginner' | 'active' | 'expert' | 'legend' | 'custom' | 'locked';

export interface BadgeProps {
  /** Badge type */
  type: BadgeType;
  /** Badge size */
  size?: BadgeSize;
  /** Badge name/text */
  name?: string;
  /** Custom className */
  className?: string;
  /** Whether the badge is locked */
  isLocked?: boolean;
  /** Custom icon for custom badges */
  icon?: React.ReactNode;
}