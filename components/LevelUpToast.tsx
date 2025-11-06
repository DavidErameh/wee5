
'use client';

import { useNotification } from '@/contexts/NotificationContext';

export function LevelUpToast() {
  const { notification, hideNotification } = useNotification();

  if (!notification) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg shadow-lg z-50 ${notification ? 'block' : 'hidden'}`}>
      <h4 className="font-semibold mb-2">{notification.title}</h4>
      <p className="mb-2">{notification.message}</p>
      <button 
        onClick={hideNotification}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Claim Reward
      </button>
    </div>
  );
}
