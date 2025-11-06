// lib/initialize-realtime.ts
// Server-side initialization for real-time services

import { initRealtimeServices } from '@/services/realtime-service';

// Initialize real-time services when module loads
// For Next.js serverless functions, this will run when the function initializes
// In a production environment with long-running processes, this would maintain connections
let initialized = false;

export async function ensureRealtimeInitialized(): Promise<void> {
  if (!initialized) {
    try {
      await initRealtimeServices();
      initialized = true;
      console.log('Real-time services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize real-time services:', error);
      // Don't throw to avoid breaking the application, but log the error
    }
  }
}

// Export the function for use in API routes
export default async function initializeRealtime(): Promise<void> {
  await ensureRealtimeInitialized();
}