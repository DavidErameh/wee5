export interface UserProfileCardProps {
  /** User ID to display */
  userId: string;
  /** Experience ID context */
  experienceId: string;
  /** User's current XP */
  xp: number;
  /** User's current level */
  level: number;
  /** Total posts by user */
  totalPosts: number;
  /** Total messages by user */
  totalMessages: number;
  /** Total reactions by user */
  totalReactions: number;
  /** User's display name */
  displayName?: string;
  /** User's avatar URL */
  avatarUrl?: string;
  /** Custom className */
  className?: string;
}