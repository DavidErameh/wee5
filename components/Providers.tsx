
'use client';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { ReactNode } from 'react';
import { LevelUpToast } from './LevelUpToast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './WebSocketProvider';

// Create a single instance of QueryClient
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <WebSocketProvider>
          {children}
          <LevelUpToast />
        </WebSocketProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
