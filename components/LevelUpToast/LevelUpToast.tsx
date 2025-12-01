// components/LevelUpToast/LevelUpToast.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';

interface LevelUpToastProps {
  /** Whether toast is visible */
  isVisible: boolean;
  /** New level reached */
  level: number;
  /** Reward description */
  reward?: string;
  /** Callback when toast is dismissed */
  onDismiss: () => void;
  /** Auto-dismiss duration in ms */
  duration?: number;
  /** Play sound effect */
  playSound?: boolean;
}

const toastVariants = {
  hidden: { x: 400, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

export const LevelUpToast: React.FC<LevelUpToastProps> = ({
  isVisible,
  level,
  reward,
  onDismiss,
  duration = 3000,
  playSound = false,
}) => {
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    if (isVisible) {
      // Trigger confetti burst
      triggerConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8, x: 0.9 }
      });

      // Play sound if enabled
      if (playSound) {
        const audio = new Audio('/sounds/level-up.mp3');
        audio.volume = 0.3;
        audio.play().catch(console.error);
      }

      // Auto-dismiss after duration
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss, playSound, triggerConfetti]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 right-6 z-toast w-[350px] min-h-[100px] rounded-lg bg-gradient-to-r from-accent to-accent-light p-6 shadow-glow-lg"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Sparkles className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">
                🎉 LEVEL UP!
              </h3>
              <p className="text-sm text-white/90">
                You reached Level {level}
              </p>
              {reward && (
                <p className="text-xs text-white/80 mt-1">
                  Reward: {reward}
                </p>
              )}
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

LevelUpToast.displayName = 'LevelUpToast';

export default LevelUpToast;