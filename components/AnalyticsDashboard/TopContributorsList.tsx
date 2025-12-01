// components/AnalyticsDashboard/TopContributorsList.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const data = [
  { id: 'user_1', name: 'Alice Smith', xp: 12450, level: 25 },
  { id: 'user_2', name: 'Bob Johnson', xp: 11200, level: 23 },
  { id: 'user_3', name: 'Charlie Brown', xp: 9800, level: 20 },
  { id: 'user_4', name: 'Diana Prince', xp: 8700, level: 18 },
  { id: 'user_5', name: 'Eve Adams', xp: 7600, level: 16 },
];

export const TopContributorsList: React.FC = () => {
  return (
    <motion.div
      className="h-[300px] rounded-xl border border-border bg-[#111111] p-4 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="font-bold text-white mb-4">Top Contributors</h3>
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
        {data.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-2 hover:bg-dark-hover rounded transition-colors">
            <div className="flex items-center">
              <span className={cn(
                'w-5 h-5 flex items-center justify-center rounded-full text-xs mr-2 font-semibold bg-accent/20 text-accent'
              )}>
                {index + 1}
              </span>
              {/* Avatar placeholder */}
              <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center mr-2">
                <User className="w-3 h-3 text-text-muted" />
              </div>
              <span className="font-medium text-white text-sm">
                {user.name}
              </span>
            </div>
            <div className="text-right">
              <div className="font-medium text-white text-xs">{user.xp.toLocaleString()} XP</div>
              <div className="text-xs text-text-muted">Lvl {user.level}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

TopContributorsList.displayName = 'TopContributorsList';
