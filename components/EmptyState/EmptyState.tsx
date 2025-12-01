import React from 'react';
import { Activity, Trophy, Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 'leaderboard' | 'rewards' | 'activity' | 'analytics' | 'default';

interface EmptyStateProps {
  /** Type of empty state */
  type?: EmptyStateType;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional action button */
  action?: {
    text: string;
    onClick: () => void;
  };
  /** Custom className */
  className?: string;
}

// Define type-specific configurations
const typeConfig: Record<EmptyStateType, { icon: React.ReactNode; color: string }> = {
  leaderboard: { 
    icon: <Trophy className="w-16 h-16" />, 
    color: 'text-accent' 
  },
  rewards: { 
    icon: <Trophy className="w-16 h-16" />, 
    color: 'text-warning' 
  },
  activity: { 
    icon: <MessageCircle className="w-16 h-16" />, 
    color: 'text-success' 
  },
  analytics: { 
    icon: <Activity className="w-16 h-16" />, 
    color: 'text-text-muted' 
  },
  default: { 
    icon: <Activity className="w-16 h-16" />, 
    color: 'text-text-muted' 
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  icon,
  action,
  className,
}) => {
  const config = typeConfig[type];
  const displayIcon = icon || config.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-dark',
      className
    )}>
      <div className={cn('mb-6', config.color)}>
        {displayIcon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-text-muted max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-accent hover:bg-accent-light text-white rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black active:scale-98"
        >
          {action.text}
        </button>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;