
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  title: string;
  message: string;
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (newNotification: Notification) => {
    setNotification(newNotification);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
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
