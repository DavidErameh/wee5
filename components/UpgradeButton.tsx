
'use client';

import { Button } from 'frosted-ui';
import { useWhop } from '@whop/react';

export function UpgradeButton() {
  const { iframeSdk } = useWhop();

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: 'plan_premium_XXXX' }), // Replace with your actual premium plan ID
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout config');
      }

      const { checkoutConfig } = await res.json();

      if (checkoutConfig) {
        iframeSdk?.inAppPurchase({ config_id: checkoutConfig.id });
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
    }
  };

  return (
    <Button color="blue" onClick={handleUpgrade}>
      Upgrade to Premium
    </Button>
  );
}
