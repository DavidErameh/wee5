'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface AnalyticsProps {
  experienceId: string;
}

interface AnalyticsData {
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
  }>;
}

export function AnalyticsDashboard({ experienceId }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAnalytics();
  }, [experienceId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?experienceId=${experienceId}&timeframe=${timeframe}`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
      } else {
        showNotification({
          title: 'Error',
          message: data.error || 'Failed to fetch analytics'
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to fetch analytics data'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">No analytics data available</p>
      </div>
    );
  }

  const { engagement, leaderboard } = analytics;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Engagement Analytics</h1>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black ${
                timeframe === period
                  ? 'bg-accent text-white'
                  : 'bg-dark text-text-muted hover:bg-dark-hover'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-muted">Total Activities</h3>
          <p className="text-3xl font-bold mt-2 text-white">{engagement.totalActivities}</p>
        </div>

        <div className="bg-dark p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-muted">Active Users</h3>
          <p className="text-3xl font-bold mt-2 text-white">{engagement.activeUsers}</p>
        </div>

        <div className="bg-dark p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-muted">Avg XP/User</h3>
          <p className="text-3xl font-bold mt-2 text-white">{engagement.avgXpPerUser}</p>
        </div>

        <div className="bg-dark p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-muted">Period</h3>
          <p className="text-lg font-bold mt-2 text-white">
            {new Date(analytics.period.start).toLocaleDateString()} - {new Date(analytics.period.end).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-white mb-4">Activity by Type</h3>
          <div className="space-y-2">
            {Object.entries(engagement.activityByType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="capitalize text-white">{type}</span>
                <span className="font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-white mb-4">Top 10 Users</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((user, index) => (
              <div key={user.userId} className="flex justify-between items-center p-2 hover:bg-dark-hover rounded">
                <div className="flex items-center">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs mr-2 ${
                    index < 3 ? 'bg-accent/20 text-accent' : 'bg-dark-hover text-text-muted'
                  }`}>
                    {user.rank}
                  </span>
                  <span className="font-medium text-white">{user.userId.slice(0, 8)}...</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">{user.xp} XP</div>
                  <div className="text-sm text-text-muted">Level {user.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-dark p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-white mb-4">XP Earned by Day</h3>
        <div className="h-64 flex items-end space-x-1">
          {Object.entries(engagement.xpByDay)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .slice(-20) // Show last 20 days
            .map(([date, xp]) => {
              // Calculate bar height proportionally
              const maxXP = Math.max(...Object.values(engagement.xpByDay));
              const height = maxXP > 0 ? (xp / maxXP) * 100 : 0;

              return (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-accent to-accent-light rounded-t hover:opacity-80 transition-all"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-text-muted mt-1">
                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-text-muted">{xp}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}