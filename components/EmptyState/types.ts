type EmptyStateType = 'leaderboard' | 'rewards' | 'activity' | 'analytics' | 'default';

export interface EmptyStateProps {
  /** Type of empty state */
  type?: EmptyStateType;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional action button */
  action?: {
    text: string;
    onClick: () => void;
  };
  /** Custom className */
  className?: string;
}