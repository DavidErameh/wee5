"use client";

import { useState } from 'react';
import { Gift, Plus, Trash2 } from 'lucide-react';

interface Reward {
    id: string;
    level: number;
    name: string;
    type: 'role' | 'discount' | 'content';
}

export const RewardConfig = () => {
    const [rewards, setRewards] = useState<Reward[]>([
        { id: '1', level: 5, name: 'Active Member Role', type: 'role' },
        { id: '2', level: 10, name: '10% Off Merch', type: 'discount' },
        { id: '3', level: 20, name: 'VIP Access', type: 'role' },
    ]);

    const handleDelete = (id: string) => {
        setRewards(rewards.filter(r => r.id !== id));
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                        <Gift className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Level Rewards</h3>
                        <p className="text-text-muted text-sm">Manage automated rewards for leveling up</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Add Reward
                </button>
            </div>

            <div className="space-y-4">
                {rewards.map((reward) => (
                    <div
                        key={reward.id}
                        className="flex items-center justify-between p-4 glass-panel glass-panel-hover group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                                {reward.level}
                            </div>
                            <div>
                                <p className="text-white font-medium">{reward.name}</p>
                                <p className="text-xs text-text-muted uppercase tracking-wider">{reward.type}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(reward.id)}
                            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {rewards.length === 0 && (
                    <div className="text-center py-8 text-text-muted">
                        No rewards configured yet.
                    </div>
                )}
            </div>
        </div>
    );
};
