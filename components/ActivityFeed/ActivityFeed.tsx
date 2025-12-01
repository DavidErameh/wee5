'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MessageSquare, ThumbsUp, FileText } from 'lucide-react';

interface ActivityEntry {
    id: string;
    user_id: string;
    activity_type: 'message' | 'post' | 'reaction';
    xp_awarded: number;
    created_at: string;
    metadata?: {
        content?: string;
        user_name?: string;
    };
}

interface ActivityFeedProps {
    experienceId: string;
    limit?: number;
}

const ACTIVITY_ICONS = {
    message: MessageSquare,
    post: FileText,
    reaction: ThumbsUp,
};

const ACTIVITY_COLORS = {
    message: 'text-blue-400 bg-blue-400/10',
    post: 'text-green-400 bg-green-400/10',
    reaction: 'text-yellow-400 bg-yellow-400/10',
};

export function ActivityFeed({ experienceId, limit = 50 }: ActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'message' | 'post' | 'reaction'>('all');

    useEffect(() => {
        async function fetchActivities() {
            setLoading(true);
            let query = supabase()
                .from('activity_log')
                .select('*')
                .eq('experience_id', experienceId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (filter !== 'all') {
                query = query.eq('activity_type', filter);
            }

            const { data, error } = await query;

            if (!error && data) {
                setActivities(data);
            }
            setLoading(false);
        }

        fetchActivities();

        // Subscribe to real-time updates
        const subscription = supabase()
            .channel(`activity_feed:${experienceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_log',
                    filter: `experience_id=eq.${experienceId}`,
                },
                (payload) => {
                    setActivities((prev) => [payload.new as ActivityEntry, ...prev.slice(0, limit - 1)]);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [experienceId, filter, limit]);

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="bg-dark rounded-lg border border-border p-6">
            {/* Header with Filter */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-6 h-6 text-accent" />
                    Recent Activity
                </h3>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {(['all', 'message', 'post', 'reaction'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${filter === f
                                    ? 'bg-accent text-white'
                                    : 'text-text-muted hover:bg-dark-hover'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-dark-hover rounded-lg p-4 animate-pulse h-16" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    <AnimatePresence initial={false}>
                        {activities.map((activity) => {
                            const Icon = ACTIVITY_ICONS[activity.activity_type];
                            const colorClass = ACTIVITY_COLORS[activity.activity_type];

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-dark-hover rounded-lg p-4 flex items-center gap-4 hover:bg-dark transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {activity.metadata?.user_name || 'Anonymous'}{' '}
                                            <span className="text-text-muted font-normal">
                                                {activity.activity_type === 'message' && 'sent a message'}
                                                {activity.activity_type === 'post' && 'created a post'}
                                                {activity.activity_type === 'reaction' && 'reacted'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-text-muted">
                                            {formatTimeAgo(activity.created_at)}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-accent">+{activity.xp_awarded} XP</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
