'use client';

import { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

/**
 * Toast Notification Component
 * Per IMPLEMENTATION_PLAN.md Phase 2 - Notification System
 * Displays toast notifications with auto-dismiss
 */
export function Toast() {
  const { notification, hideNotification } = useNotification();

  useEffect(() => {
    if (notification) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-toast animate-slide-in">
      <div className="bg-dark rounded-lg shadow-lg border border-border p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              {notification.title}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {notification.message}
            </p>
          </div>
          <button
            onClick={hideNotification}
            className="ml-4 text-text-muted hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
