// components/AnalyticsDashboard/AnalyticsDashboard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveUsersChart } from './ActiveUsersChart';
import { XpDistributionChart } from './XpDistributionChart';
import { TopContributorsList } from './TopContributorsList';
import { EngagementHeatmap } from './EngagementHeatmap';

interface AnalyticsDashboardProps {
  experienceId: string;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  experienceId,
  className,
}) => {
  return (
    <motion.div
      className={cn('p-6 space-y-8', className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-accent" />
          Analytics Dashboard
        </h1>
        <p className="text-text-muted mt-1">
          Real-time engagement metrics for your community.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users Graph (Widget 1) */}
        <ActiveUsersChart />

        {/* XP Distribution (Widget 2) */}
        <XpDistributionChart />

        {/* Top Contributors (Widget 3) */}
        <TopContributorsList />

        {/* Engagement Heatmap (Widget 4) */}
        <EngagementHeatmap />
      </div>
    </motion.div>
  );
};

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;