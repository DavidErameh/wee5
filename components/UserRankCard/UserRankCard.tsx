'use client';

import { useEffect, useState } from 'react';
import { supabase as getSupabase } from '@/lib/db';
import { calculateProgress } from '@/lib/xp-logic';
import { motion } from 'framer-motion';
import { Trophy, MessageSquare, ThumbsUp, FileText } from 'lucide-react';

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
    xp_today?: number;
}

interface UserBadge {
    badge_id: string;
    badges: {
        name: string;
        image_url: string;
    }
}

export function UserRankCard({ userId, experienceId }: RankCardProps) {
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

                if (error) throw error;
                setBadges(data as UserBadge[]);
            } catch (err) {
                console.error('Error fetching badges:', err);
            }
        }

        fetchUserData();
        fetchBadges();

        const supabaseClient = getSupabase();
        const userSubscription = supabaseClient
            .channel(`user-stats:${userId}:${experienceId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `user_id=eq.${userId}` }, (payload) => {
                if (payload.new.experience_id === experienceId) setUserData(payload.new as UserData);
            })
            .subscribe();

        return () => { userSubscription.unsubscribe(); };
    }, [userId, experienceId]);

    if (loading) {
        return (
            <div className="w-full h-64 glass-panel animate-pulse" />
        );
    }

    if (!userData) {
        return (
            <div className="w-full p-8 glass-panel text-center">
                <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Start Your Journey</h3>
                <p className="text-text-muted">Participate in the community to earn XP and unlock rewards!</p>
            </div>
        );
    }

    const progress = calculateProgress(userData.xp, userData.level);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden w-full p-8 rounded-3xl bg-gradient-to-br from-accent/90 to-purple-600/90 border border-white/20 shadow-2xl backdrop-blur-xl"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-baseline gap-3 mb-1">
                            <h2 className="text-4xl font-bold text-white">Level {userData.level}</h2>
                            <span className="text-white/80 font-medium">Rank #1</span> {/* Placeholder Rank */}
                        </div>
                        <p className="text-white/60 font-medium tracking-wide uppercase text-sm">
                            {progress.current.toFixed(0)} / {progress.needed.toFixed(0)} XP to Level {userData.level + 1}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-white/60 text-sm font-medium uppercase tracking-wide mb-1">Total XP</p>
                        <p className="text-3xl font-bold text-white">{userData.xp.toLocaleString()}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-6 bg-black/20 rounded-full overflow-hidden mb-8 backdrop-blur-sm border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2 text-white/60">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Messages</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{userData.total_messages}</p>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2 text-white/60">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Posts</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{userData.total_posts}</p>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2 text-white/60">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Reactions</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{userData.total_reactions}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
