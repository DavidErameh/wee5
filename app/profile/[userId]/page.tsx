'use client';

import { useEffect, useState } from 'react';
import { RankCard } from '@/components/RankCard';
import { supabase } from '@/lib/db';
import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';

interface UserProfilePageProps {
    params: {
        userId: string;
    };
    searchParams: {
        experienceId?: string;
    };
}

interface Activity {
    id: string;
    activity_type: string;
    xp_awarded: number;
    created_at: string;
}

export default function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
    const { userId } = params;
    const experienceId = searchParams.experienceId || 'default';

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            const { data, error } = await supabase()
                .from('activity_log')
                .select('*')
                .eq('user_id', userId)
                .eq('experience_id', experienceId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setActivities(data);
            }
            setLoading(false);
        }

        fetchActivities();
    }, [userId, experienceId]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Trophy className="w-10 h-10 text-accent" />
                    User Profile
                </h1>
                <p className="text-text-muted">View XP progress, badges, and activity history</p>
            </div>

            {/* Rank Card */}
            <div className="mb-8">
                <RankCard userId={userId} experienceId={experienceId} />
            </div>

            {/* Activity History */}
            <div className="bg-dark rounded-lg border border-border p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-accent" />
                    Recent Activity
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-dark-hover rounded-lg p-4 animate-pulse h-16" />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                        <p>No activity yet. Start participating to earn XP!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="bg-dark-hover rounded-lg p-4 flex items-center justify-between hover:bg-dark transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {activity.activity_type === 'message' && (
                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-accent" />
                                        </div>
                                    )}
                                    {activity.activity_type === 'post' && (
                                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-success" />
                                        </div>
                                    )}
                                    {activity.activity_type === 'reaction' && (
                                        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-warning" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold capitalize">{activity.activity_type}</p>
                                        <p className="text-sm text-text-muted">
                                            {new Date(activity.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-accent">+{activity.xp_awarded} XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
