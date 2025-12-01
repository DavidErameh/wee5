import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Flame, MessageCircle, FileText } from 'lucide-react';
import { XPProgressBar } from '@/components/XPProgressBar/XPProgressBar';
import { cn } from '@/lib/utils';
import { calculateProgress } from '@/lib/xp-logic';

interface RankCardProps {
  /** User ID to display */
  userId: string;
  /** Experience ID context */
  experienceId: string;
  /** User's current XP */
  xp: number;
  /** User's current level */
  level: number;
  /** Total posts by user */
  totalPosts: number;
  /** Total messages by user */
  totalMessages: number;
  /** Total reactions by user */
  totalReactions: number;
  /** User's display name */
  displayName?: string;
  /** User's avatar URL */
  avatarUrl?: string;
  /** Custom className */
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  experienceId,
  xp,
  level,
  totalPosts,
  totalMessages,
  totalReactions,
  displayName = 'User',
  avatarUrl,
  className,
}) => {
  const progress = calculateProgress(xp, level);
  const [isHovered, setIsHovered] = useState(false);

  // Format display name (truncate ID if no display name provided)
  const displayText = displayName || `${userId.substring(0, 8)}...`;

  return (
    <motion.div
      className={cn(
        'bg-dark rounded-lg p-6 transition-all duration-200',
        'border border-border',
        'hover:bg-dark-hover cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(107, 70, 193, 0.25)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-16 h-16 rounded-full border-2 border-accent"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center bg-accent/10">
              <User className="text-accent w-8 h-8" />
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{displayText}</h3>
          <p className="text-sm text-text-muted">Level {level}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">Total XP: {xp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <XPProgressBar 
          current={progress.current} 
          max={progress.needed} 
          size="medium" 
          showLabel={true} 
        />
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{progress.current.toLocaleString()} XP</span>
          <span>{progress.needed.toLocaleString()} XP for next level</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs text-text-muted">Posts</p>
          <p className="text-sm font-semibold text-white">{totalPosts}</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <MessageCircle className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs text-text-muted">Messages</p>
          <p className="text-sm font-semibold text-white">{totalMessages}</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Flame className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs text-text-muted">Reactions</p>
          <p className="text-sm font-semibold text-white">{totalReactions}</p>
        </div>
      </div>
    </motion.div>
  );
};

UserProfileCard.displayName = 'UserProfileCard';

export default UserProfileCard;