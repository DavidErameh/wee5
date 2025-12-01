export interface AnalyticsData {
  period: {
    start: string;
    end: string;
    timeframe: string;
  };
  engagement: {
    totalActivities: number;
    activeUsers: number;
    avgXpPerUser: number;
    activityByType: Record<string, number>;
    xpByDay: Record<string, number>;
  };
  leaderboard: Array<{
    rank: number;
    userId: string;
    xp: number;
    level: number;
    displayName?: string;
  }>;
}

export interface AnalyticsDashboardProps {
  experienceId: string;
  /** Custom className */
  className?: string;
}