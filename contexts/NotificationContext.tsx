
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

/**
 * Notification Context
 * Per IMPLEMENTATION_PLAN.md Phase 2 - Notification System
 * Provides toast notifications throughout the app
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number; // milliseconds, default 5000
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  hideNotification: () => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (newNotification: Notification) => {
    setNotification({
      ...newNotification,
      type: newNotification.type || 'info',
      duration: newNotification.duration || 5000,
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Helper methods for common notification types
  const showSuccess = (title: string, message: string) => {
    showNotification({ title, message, type: 'success' });
  };

  const showError = (title: string, message: string) => {
    showNotification({ title, message, type: 'error' });
  };

  const showWarning = (title: string, message: string) => {
    showNotification({ title, message, type: 'warning' });
  };

  const showInfo = (title: string, message: string) => {
    showNotification({ title, message, type: 'info' });
  };

  // Auto-dismiss notification after duration
  useEffect(() => {
    if (notification && notification.duration) {
      const timer = setTimeout(() => {
        hideNotification();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notification, 
        showNotification, 
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {/* Render toast notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div 
            className={`rounded-lg shadow-lg border p-4 max-w-sm ${
              notification.type === 'success' ? 'bg-green-50 border-green-200' :
              notification.type === 'error' ? 'bg-red-50 border-red-200' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-semibold ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`mt-1 text-sm ${
                  notification.type === 'success' ? 'text-green-700' :
                  notification.type === 'error' ? 'text-red-700' :
                  notification.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={hideNotification}
                className={`ml-4 flex-shrink-0 rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  notification.type === 'success' ? 'text-green-500 hover:text-green-600 focus:ring-green-500' :
                  notification.type === 'error' ? 'text-red-500 hover:text-red-600 focus:ring-red-500' :
                  notification.type === 'warning' ? 'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-500' :
                  'text-blue-500 hover:text-blue-600 focus:ring-blue-500'
                }`}
                aria-label="Close notification"
              >
                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
