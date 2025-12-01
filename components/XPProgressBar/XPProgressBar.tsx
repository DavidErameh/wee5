// components/XPProgressBar/XPProgressBar.tsx
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  /** Current XP value */
  current: number;
  /** Maximum XP needed for next level */
  max: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show XP numbers label */
  showLabel?: boolean;
  /** Trigger pulse animation (on XP gain) */
  triggerPulse?: boolean;
  /** Custom className */
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  current,
  max,
  size = 'medium',
  showLabel = true,
  triggerPulse = false,
  className,
}) => {
  const [percentage, setPercentage] = useState(0);
  const controls = useAnimation();

  // Calculate percentage
  useEffect(() => {
    const newPercentage = Math.min((current / max) * 100, 100);
    setPercentage(newPercentage);
  }, [current, max]);

  // Pulse animation on XP gain
  useEffect(() => {
    if (triggerPulse) {
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.3, ease: 'easeInOut' }
      });
    }
  }, [triggerPulse, controls]);

  // Size classes
  const sizeClasses = {
    small: 'h-6 text-xs',
    medium: 'h-8 text-sm',
    large: 'h-12 text-base',
  };

  // Near level-up glow effect
  const isNearLevelUp = percentage > 90;

  return (
    <motion.div
      animate={controls}
      className={cn(
        'relative rounded-full overflow-hidden bg-dark',
        sizeClasses[size],
        isNearLevelUp && 'ring-2 ring-accent/50 shadow-glow',
        className
      )}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${current} out of ${max} XP`}
    >
      {/* Gradient Fill */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent-light"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Label */}
      {showLabel && (
        <div className="relative z-10 flex items-center justify-center h-full font-bold text-white">
          {current.toLocaleString()} / {max.toLocaleString()} XP
        </div>
      )}

      {/* Shimmer effect when near level-up */}
      {isNearLevelUp && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

XPProgressBar.displayName = 'XPProgressBar';

export default XPProgressBar;