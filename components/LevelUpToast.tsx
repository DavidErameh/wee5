
'use client';

import { useNotification } from '@/contexts/NotificationContext';
import { Toast, Heading, Text, Button } from 'frosted-ui';

export function LevelUpToast() {
  const { notification, hideNotification } = useNotification();

  if (!notification) {
    return null;
  }

  return (
    <Toast variant="success" open={!!notification} onOpenChange={hideNotification}>
      <Heading size="4">{notification.title}</Heading>
      <Text>{notification.message}</Text>
      <Button color="green" onClick={hideNotification}>Claim Reward</Button>
    </Toast>
  );
}
