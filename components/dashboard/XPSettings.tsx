"use client";

import { useState } from 'react';
import { Settings, MessageSquare, Mic, Calendar } from 'lucide-react';

export const XPSettings = () => {
    const [settings, setSettings] = useState({
        messageXp: 15,
        voiceXp: 10,
        eventXp: 50,
        cooldown: 60,
    });

    const handleChange = (key: string, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-accent/20 rounded-lg">
                    <Settings className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">XP Configuration</h3>
                    <p className="text-text-muted text-sm">Adjust how much XP members earn for activities</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Message XP */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-white font-medium">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            Chat Message XP
                        </label>
                        <span className="text-accent font-bold bg-accent/10 px-3 py-1 rounded-lg">
                            {settings.messageXp} XP
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={settings.messageXp}
                        onChange={(e) => handleChange('messageXp', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <p className="text-xs text-text-muted">XP awarded per valid message (subject to cooldown)</p>
                </div>

                {/* Voice XP */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-white font-medium">
                            <Mic className="w-4 h-4 text-green-400" />
                            Voice Chat XP (per min)
                        </label>
                        <span className="text-accent font-bold bg-accent/10 px-3 py-1 rounded-lg">
                            {settings.voiceXp} XP
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={settings.voiceXp}
                        onChange={(e) => handleChange('voiceXp', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>

                {/* Event XP */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-white font-medium">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            Event Attendance XP
                        </label>
                        <span className="text-accent font-bold bg-accent/10 px-3 py-1 rounded-lg">
                            {settings.eventXp} XP
                        </span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={settings.eventXp}
                        onChange={(e) => handleChange('eventXp', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-bold rounded-lg transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
