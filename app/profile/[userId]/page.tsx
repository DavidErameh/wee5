'use client';

import { useEffect, useState } from 'react';
import { UserRankCard } from '@/components/UserRankCard/UserRankCard';
import { supabase } from '@/lib/db';
import { Trophy, TrendingUp, Calendar, Award, MessageSquare, Mic } from 'lucide-react';

interface UserProfilePageProps {
    params: Promise<{
        userId: string;
    }>;
    searchParams: Promise<{
        experienceId?: string;
    }>;
}

interface Activity {
    id: string;
    activity_type: string;
    xp_awarded: number;
    created_at: string;
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
    const { userId } = await params;
    const { experienceId = 'default' } = await searchParams;

    // Note: In a real server component we'd fetch initial data here, 
    // but for now we'll keep the client-side fetching pattern for consistency with the previous implementation
    // or switch to a client component wrapper if needed. 
    // However, since this was a client component before ('use client'), we can keep it as is but we need to handle async params in Next.js 15+.
    // Actually, let's make this a server component that renders a client component for the data fetching part 
    // OR just unwrap params properly.

    return <UserProfileContent userId={userId} experienceId={experienceId} />;
}

function UserProfileContent({ userId, experienceId }: { userId: string, experienceId: string }) {
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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-white">
                    <Trophy className="w-10 h-10 text-accent" />
                    User Profile
                </h1>
                <p className="text-text-muted">View XP progress, badges, and activity history</p>
            </div>

            {/* Rank Card */}
            <div className="mb-8">
                <UserRankCard userId={userId} experienceId={experienceId} />
            </div>

            {/* Activity History */}
            <div className="glass-panel p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <TrendingUp className="w-6 h-6 text-accent" />
                    Recent Activity
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse h-16" />
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
                                className="glass-panel glass-panel-hover p-4 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    {activity.activity_type === 'message' && (
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-blue-400" />
                                        </div>
                                    )}
                                    {activity.activity_type === 'voice' && (
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Mic className="w-5 h-5 text-green-400" />
                                        </div>
                                    )}
                                    {activity.activity_type === 'post' && (
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-purple-400" />
                                        </div>
                                    )}
                                    {activity.activity_type === 'reaction' && (
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-yellow-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-white capitalize">{activity.activity_type}</p>
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
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent">
                                        +{activity.xp_awarded} XP
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
