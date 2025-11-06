'use client';

import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Real-time Provider (Webhook-based)
 * Per IMPLEMENTATION_PLAN.md Phase 2 - Real-time Architecture Redesign
 * 
 * ARCHITECTURE CHANGE:
 * - Removed WebSocket-based approach (incompatible with Vercel serverless)
 * - Now uses webhook-only event processing
 * - Real-time UI updates via Supabase real-time subscriptions
 * - Events flow: Whop → Webhook → Database → Supabase Realtime → UI
 * 
 * This provider is kept for backward compatibility but simplified.
 * Real-time updates are now handled by:
 * 1. Whop webhooks (/api/webhook) for event processing
 * 2. Supabase real-time subscriptions in components (RankCard, LeaderboardTable)
 */

interface RealtimeContextType {
  // Kept for backward compatibility
  isConnected: boolean;
  isServiceInitialized: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  // In the new architecture:
  // - Webhooks handle event processing server-side
  // - Supabase real-time handles UI updates
  // - No client-side WebSocket connection needed
  
  return (
    <RealtimeContext.Provider value={{ 
      isConnected: true, // Always true since we use webhooks + Supabase realtime
      isServiceInitialized: true, // Always true in webhook architecture
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access real-time status
 * Note: In webhook architecture, this always returns true
 * Real-time updates are handled by Supabase subscriptions in individual components
 */
export function useWebSocket() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}