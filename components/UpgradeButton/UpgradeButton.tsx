'use client';

import { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { usePathname } from 'next/navigation';

interface UpgradeButtonProps {
  currentTier?: 'free' | 'premium' | 'enterprise';
  experienceId: string;
}

export function UpgradeButton({ currentTier = 'free', experienceId }: UpgradeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotification();
  const pathname = usePathname();

  const handleUpgrade = async (planId: string) => {
    try {
      setIsProcessing(true);

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current_user_id', // This would come from auth context
          planId,
          metadata: {
            experienceId,
            fromPage: pathname
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to checkout or open modal
        window.location.href = `/checkout/${data.configId}`;
      } else {
        showNotification({
          title: 'Error',
          message: data.error || 'Failed to initiate checkout'
        });
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to initiate checkout process'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentTier === 'enterprise') {
    return (
      <div className="bg-success/20 text-success px-4 py-2 rounded-md font-medium">
        Enterprise Plan
      </div>
    );
  }

  if (currentTier === 'premium') {
    return (
      <div className="bg-accent/20 text-accent px-4 py-2 rounded-md font-medium">
        Premium Plan
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={() => handleUpgrade('plan_premium_monthly')}
        disabled={isProcessing}
        className={`px-4 py-2 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black active:scale-98 ${
          isProcessing
            ? 'bg-text-muted cursor-not-allowed'
            : 'bg-accent hover:bg-accent-light text-white'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Upgrade to Premium ($19/mo)'}
      </button>

      <button
        onClick={() => handleUpgrade('plan_enterprise_monthly')}
        disabled={isProcessing}
        className={`px-4 py-2 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black active:scale-98 ${
          isProcessing
            ? 'bg-text-muted cursor-not-allowed'
            : 'bg-accent-light hover:bg-accent text-white'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Upgrade to Enterprise ($79/mo)'}
      </button>
    </div>
  );
}