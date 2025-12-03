"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Zap, TrendingUp } from 'lucide-react';

const data = [
    { name: 'Mon', users: 400, xp: 2400 },
    { name: 'Tue', users: 300, xp: 1398 },
    { name: 'Wed', users: 200, xp: 9800 },
    { name: 'Thu', users: 278, xp: 3908 },
    { name: 'Fri', users: 189, xp: 4800 },
    { name: 'Sat', users: 239, xp: 3800 },
    { name: 'Sun', users: 349, xp: 4300 },
];

export const AnalyticsOverview = () => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-text-muted font-medium">Active Members</span>
                    </div>
                    <p className="text-3xl font-bold text-white">1,234</p>
                    <p className="text-sm text-green-400 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" /> +12% this week
                    </p>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent/20 rounded-lg">
                            <Zap className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-text-muted font-medium">Total XP Awarded</span>
                    </div>
                    <p className="text-3xl font-bold text-white">845.2k</p>
                    <p className="text-sm text-green-400 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" /> +5% this week
                    </p>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-text-muted font-medium">Level Ups</span>
                    </div>
                    <p className="text-3xl font-bold text-white">89</p>
                    <p className="text-sm text-green-400 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" /> +2% this week
                    </p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-white mb-6">Engagement Trends</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6B46C1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6B46C1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#666"
                                tick={{ fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="xp"
                                stroke="#6B46C1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorXp)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
