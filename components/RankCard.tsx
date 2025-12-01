'use client';

import { useEffect, useState } from 'react';
import { supabase as getSupabase } from '@/lib/db';
import { calculateProgress } from '@/lib/xp-logic';

interface RankCardProps {
  userId: string;
  experienceId: string;
}

interface UserData {
  user_id: string;
  xp: number;
  level: number;
  total_messages: number;
  total_posts: number;
  total_reactions: number;
  last_activity_at: string;
  xp_today?: number; // Added for T25
}

interface UserBadge {
  badge_id: string;
  badges: {
    name: string;
    image_url: string;
  }
}

export function RankCard({ userId, experienceId }: RankCardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data, error } = await getSupabase()
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .eq('experience_id', experienceId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // User doesn't exist yet
            setUserData(null);
          } else {
            throw error;
          }
        } else {
          setUserData(data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load rank data');
      } finally {
        setLoading(false);
      }
    }

    async function fetchBadges() {
      try {
        const { data, error } = await getSupabase()
          .from('user_badges')
          .select(`
            badge_id,
            badges (name, image_url)
          `)
          .eq('user_id', userId)
          .eq('experience_id', experienceId);

        if (error) {
          throw error;
        }
        setBadges(data as UserBadge[]);
      } catch (err) {
        console.error('Error fetching badges:', err);
      }
    }

    fetchUserData();
    fetchBadges();

    // Subscribe to real-time updates for user stats
    const supabaseClient = getSupabase();
    const userSubscription = supabaseClient
      .channel(`user-stats:${userId}:${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.experience_id === experienceId) {
            setUserData(payload.new as UserData);
          }
        }
      )
      .subscribe();

    // Subscribe to real-time updates for badges
    const badgeSubscription = supabaseClient
      .channel(`user-badges:${userId}:${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBadges(); // Refresh badges when new one is added
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBadges(); // Refresh badges when updated
        }
      )
      .subscribe();

    return () => {
      userSubscription.unsubscribe();
      badgeSubscription.unsubscribe();
    };
  }, [userId, experienceId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-accent to-accent-light rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-border rounded w-32 mb-4"></div>
        <div className="h-4 bg-border rounded w-full mb-4"></div>
        <div className="h-16 bg-border rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error rounded-lg p-6 text-white">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-dark border border-border rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">New Member</h3>
        <p className="text-sm opacity-90">
          Start participating to earn XP and level up!
        </p>
      </div>
    );
  }

  const progress = calculateProgress(userData.xp, userData.level);

  return (
    <div className="bg-gradient-to-r from-accent to-accent-light rounded-lg p-6 text-white transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-3xl font-bold">Level {userData.level}</h3>
          <p className="text-sm opacity-90">
            {progress.current.toFixed(0)} / {progress.needed.toFixed(0)} XP
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-75">Total XP</p>
          <p className="text-2xl font-bold">{userData.xp.toLocaleString()}</p>
          {userData.xp_today !== undefined && ( // Conditionally render if xp_today is available
            <p className="text-sm text-accent">+{userData.xp_today.toLocaleString()} today</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-dark rounded-full h-4 overflow-hidden mb-4">
        <div
          className="bg-accent h-full transition-all duration-1000 ease-in-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs opacity-75 mb-1">Posts</p>
          <p className="text-lg font-bold">{userData.total_posts}</p>
        </div>
        <div>
          <p className="text-xs opacity-75 mb-1">Messages</p>
          <p className="text-lg font-bold">{userData.total_messages}</p>
        </div>
        <div>
          <p className="text-xs opacity-75 mb-1">Reactions</p>
          <p className="text-lg font-bold">{userData.total_reactions}</p>
        </div>
      </div>
      
      {/* Badges */}
      {badges.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Badges</h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <img
                key={badge.badge_id}
                src={badge.badges.image_url}
                alt={badge.badges.name}
                className="w-10 h-10 rounded-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}