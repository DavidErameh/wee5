// components/LeaderboardTable/LeaderboardRow.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface LeaderboardRowProps {
  rank: number;
  avatarUrl?: string;
  displayName: string;
  level: number;
  xp: number;
  streak?: number;
  isCurrentUser?: boolean;
  rowIndex?: number;  // Added for zebra striping
  onSelect: () => void;
}

const rankColors = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-yellow-600',
};

const rankIcons = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  avatarUrl,
  displayName,
  level,
  xp,
  streak = 0,
  isCurrentUser = false,
  onSelect,
}) => {
  const isTopThree = rank <= 3;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'cursor-pointer transition-all duration-150 hover:translate-y-[-2px] hover:shadow-glow',
        rowIndex !== undefined && rowIndex % 2 === 0 ? 'bg-dark-hover' : 'bg-dark',
        isCurrentUser && 'bg-accent/20 border border-accent shadow-glow-md' // Added shadow-glow-md
      )}
      onClick={onSelect}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center">
          {isTopThree ? (
             <span className="text-2xl">{rankIcons[rank as keyof typeof rankIcons]}</span>
          ) : (
            <span className="font-bold text-lg text-text-muted">{`#${rank}`}</span>
          )}
        </div>
      </td>

      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl || `https://avatar.vercel.sh/${displayName}`}
            alt={displayName}
            className={cn(
              'w-10 h-10 rounded-full ring-2',
              isCurrentUser ? 'ring-accent' : 'ring-border'
            )}
          />
          <div className="flex-1">
            <div className="font-semibold text-white">{displayName}</div>
            <div className="text-sm text-text-muted">Level {level}</div>
          </div>
        </div>
      </td>

      {/* XP */}
      <td className="px-4 py-3 text-right font-semibold text-white">
        {xp.toLocaleString()} XP
      </td>
      {/* Level */}
      <td className="px-4 py-3 text-right font-semibold text-white">
        {level}
      </td>
      {/* Streak */}
      <td className="px-4 py-3 text-right font-semibold text-white">
        {streak > 0 ? `${streak} 🔥` : '-'}
      </td>
    </motion.tr>
  );
};

LeaderboardRow.displayName = 'LeaderboardRow';
