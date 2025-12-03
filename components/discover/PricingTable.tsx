"use client";

import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for getting started",
        features: [
            "Basic XP System",
            "Global Leaderboard",
            "Rank Cards",
            "3 Automated Rewards",
            "Community Support",
        ],
        cta: "Install for Free",
        highlight: false,
    },
    {
        name: "Premium",
        price: "$29",
        period: "/month",
        description: "For growing communities",
        features: [
            "Everything in Free",
            "Custom XP Rates",
            "Unlimited Rewards",
            "Engagement Analytics",
            "Custom Badges",
            "Priority Support",
        ],
        cta: "Start Free Trial",
        highlight: true,
    },
];

export const PricingTable = () => {
    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-text-muted text-lg">
                        Choose the plan that fits your community size.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative p-8 rounded-3xl border ${plan.highlight
                                    ? "bg-accent/10 border-accent shadow-2xl shadow-accent/20"
                                    : "bg-white/5 border-white/10"
                                } backdrop-blur-md flex flex-col`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-text-muted mb-6">{plan.description}</p>
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-text-muted ml-2">{plan.period}</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-white/90">
                                        <Check className={`w-5 h-5 mr-3 ${plan.highlight ? "text-accent" : "text-white/50"}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="https://whop.com/apps/wee5/install"
                                className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-200 ${plan.highlight
                                        ? "bg-accent hover:bg-accent-light text-white shadow-lg hover:shadow-accent/25"
                                        : "bg-white text-black hover:bg-gray-200"
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
