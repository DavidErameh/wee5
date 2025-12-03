'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MessageSquare, ThumbsUp, FileText, Zap } from 'lucide-react';

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

const ACTIVITY_CONFIG = {
    message: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    post: { icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
    reaction: { icon: ThumbsUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
};

export function ActivityFeed({ experienceId, limit = 50 }: ActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            setLoading(true);
            const { data } = await supabase()
                .from('activity_log')
                .select('*')
                .eq('experience_id', experienceId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (data) setActivities(data);
            setLoading(false);
        }

        fetchActivities();

        const subscription = supabase()
            .channel(`activity_feed:${experienceId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `experience_id=eq.${experienceId}` }, (payload) => {
                setActivities((prev) => [payload.new as ActivityEntry, ...prev.slice(0, limit - 1)]);
            })
            .subscribe();

        return () => { subscription.unsubscribe(); };
    }, [experienceId, limit]);

    const formatTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/20 rounded-lg">
                    <Zap className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white">Live Activity</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))
                ) : activities.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No recent activity</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {activities.map((activity) => {
                            const config = ACTIVITY_CONFIG[activity.activity_type] || ACTIVITY_CONFIG.message;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="group flex items-center gap-4 p-4 glass-panel glass-panel-hover"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {activity.metadata?.user_name || 'Anonymous'}
                                        </p>
                                        <p className="text-xs text-text-muted truncate">
                                            {activity.activity_type === 'message' && 'sent a message'}
                                            {activity.activity_type === 'post' && 'posted in forum'}
                                            {activity.activity_type === 'reaction' && 'reacted'}
                                            <span className="mx-1">•</span>
                                            {formatTimeAgo(activity.created_at)}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent">
                                            +{activity.xp_awarded} XP
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
