import React from 'react';
import { cn } from '@/lib/utils';

type BadgeSize = 'tiny' | 'small' | 'medium' | 'large';
type BadgeType = 'beginner' | 'active' | 'expert' | 'legend' | 'custom' | 'locked';

interface BadgeProps {
  /** Badge type */
  type: BadgeType;
  /** Badge size */
  size?: BadgeSize;
  /** Badge name/text */
  name?: string;
  /** Custom className */
  className?: string;
  /** Whether the badge is locked */
  isLocked?: boolean;
  /** Custom icon for custom badges */
  icon?: React.ReactNode;
}

// Define size classes
const sizeClasses = {
  tiny: 'w-4 h-4 text-2xs',
  small: 'w-6 h-6 text-xs',
  medium: 'w-8 h-8 text-sm',
  large: 'w-12 h-12 text-base',
};

// Define type colors
const typeColors = {
  beginner: 'text-success border-success/50 bg-success/10',
  active: 'text-warning border-warning/50 bg-warning/10', 
  expert: 'text-error border-error/50 bg-error/10',
  legend: 'text-accent border-accent/50 bg-accent/10',
  custom: 'text-text-muted border-text-muted/50 bg-text-muted/10',
  locked: 'text-text-muted border-text-muted/50 bg-transparent'
};

// Define type icons
const typeIcons = {
  beginner: '🌱',
  active: '⚡', 
  expert: '🔥',
  legend: '👑',
  custom: '⭐',
  locked: '🔒'
};

export const Badge: React.FC<BadgeProps> = ({
  type,
  size = 'medium',
  name,
  className,
  isLocked = false,
  icon,
}) => {
  const currentType = isLocked ? 'locked' : type;
  const sizeClass = sizeClasses[size];
  const colorClass = typeColors[currentType];
  const displayIcon = icon || typeIcons[currentType];
  
  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-full border-2 font-bold flex-shrink-0 select-none',
        sizeClass,
        colorClass,
        isLocked && 'grayscale opacity-50 border-dashed',
        className
      )}
      title={name}
    >
      <span className="flex items-center justify-center w-full h-full">
        {displayIcon}
      </span>
    </div>
  );
};

Badge.displayName = 'Badge';

export default Badge;