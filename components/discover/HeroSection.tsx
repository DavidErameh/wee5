"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export const HeroSection = () => {
    return (
        <div className="relative overflow-hidden py-20 lg:py-32">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-accent/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                        Gamify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Community</span>
                    </h1>
                    <p className="mt-4 text-xl text-text-muted max-w-2xl mx-auto mb-10">
                        Boost engagement, retention, and activity with a powerful XP system, real-time leaderboards, and automated rewards. Built exclusively for Whop.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="https://whop.com/apps/wee5/install" // Placeholder install link
                            target="_blank"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-accent hover:bg-accent-light rounded-xl shadow-lg hover:shadow-accent/25 hover:-translate-y-1"
                        >
                            Add to Whop
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-xl hover:-translate-y-1"
                        >
                            View Features
                        </Link>
                    </div>
                </motion.div>

                {/* Dashboard Preview Image Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-16 relative mx-auto max-w-5xl"
                >
                    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-2 shadow-2xl">
                        <div className="rounded-xl overflow-hidden bg-dark aspect-[16/9] flex items-center justify-center border border-white/5">
                            <p className="text-text-muted">App Dashboard Preview Image</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
