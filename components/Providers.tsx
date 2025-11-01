
'use client';

import { WhopApp } from '@whop/react/components';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ReactNode } from 'react';
import { LevelUpToast } from './LevelUpToast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <WhopApp>{children}</WhopApp>
      <LevelUpToast />
    </NotificationProvider>
  );
}
