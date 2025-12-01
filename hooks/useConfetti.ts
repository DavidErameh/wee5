import { useCallback } from 'react';
import { triggerConfetti as confettiUtil } from '@/lib/animations/confetti';

export const useConfetti = () => {
  const triggerConfetti = useCallback((options: Parameters<typeof confettiUtil>[0] = {}) => {
    // Set default options for WEE5 design system
    const defaultOptions = {
      particleCount: 50,
      spread: 70,
      colors: ['#6B46C1', '#9F7AEA', '#FFFFFF', '#10B981', '#F59E0B'],
      gravity: 0.5,
      ticks: 200,
      ...options
    };
    
    return confettiUtil(defaultOptions);
  }, []);

  return { triggerConfetti };
};

export default useConfetti;