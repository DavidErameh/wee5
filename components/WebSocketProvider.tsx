
'use client';

import { useEffect } from 'react';
import { initializeWebsocket } from '@/lib/websocket';

interface WebSocketProviderProps {
  userId: string;
}

export function WebSocketProvider({ userId }: WebSocketProviderProps) {
  useEffect(() => {
    if (userId) {
      const websocket = initializeWebsocket(userId);

      return () => {
        websocket.disconnect();
      };
    }
  }, [userId]);

  return null;
}
