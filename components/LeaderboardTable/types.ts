export interface LeaderboardEntry {
  rank: number;
  userId: string;
  xp: number;
  level: number;
  streak?: number;
  total_messages: number;
  total_posts: number;
  total_reactions: number;
  display_name?: string;
  avatar_url?: string;
}

export interface LeaderboardTableProps {
  experienceId: string;
  initialFilter?: 'all-time' | 'week' | 'month';
  limit?: number;
  /** Custom className */
  className?: string;
}