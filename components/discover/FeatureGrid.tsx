"use client";

import { motion } from "framer-motion";
import { Trophy, BarChart3, Zap, Shield, Gift, Users } from "lucide-react";

const features = [
    {
        icon: Trophy,
        title: "XP & Leveling",
        description: "Award XP for chat, voice, and events. Let members level up and unlock status.",
    },
    {
        icon: BarChart3,
        title: "Real-time Leaderboards",
        description: "Live updating leaderboards that spark healthy competition among members.",
    },
    {
        icon: Gift,
        title: "Automated Rewards",
        description: "Automatically assign roles, give discounts, or unlock content when users level up.",
    },
    {
        icon: Zap,
        title: "Instant Setup",
        description: "Get started in seconds. No complex configuration required to start earning XP.",
    },
    {
        icon: Shield,
        title: "Anti-Spam System",
        description: "Smart cooldowns and rate limiting ensure engagement is genuine and organic.",
    },
    {
        icon: Users,
        title: "Engagement Analytics",
        description: "Track community growth, active members, and top contributors with detailed charts.",
    },
];

export const FeatureGrid = () => {
    return (
        <section id="features" className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">grow your community</span>
                    </h2>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto">
                        Powerful tools designed to turn passive members into active contributors.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-300 backdrop-blur-sm"
                        >
                            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-text-muted leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
