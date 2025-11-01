'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { xpForNextLevel } from '@/lib/xp-logic';

interface RankCardProps {
  userId: string;
  experienceId: string;
}

import { Card, Flex, Avatar, Box, Heading, Text, ProgressBar } from 'frosted-ui';
import { useNotification } from '@/contexts/NotificationContext';
import { useRef } from 'react';

export function RankCard({ userId, experienceId }: RankCardProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (userData && prevLevelRef.current !== null && userData.level > prevLevelRef.current) {
      showNotification({
        title: `🎉 Level ${userData.level} Reached!`,
        message: `You have been awarded with new rewards!`,
      });
    }
    prevLevelRef.current = userData?.level;
  }, [userData, showNotification]);

  useEffect(() => {
    async function fetchUserData() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .eq('experience_id', experienceId)
        .single();

      if (data) {
        setUserData(data);
      }
      setLoading(false);
    }

    fetchUserData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUserData(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, experienceId]);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>No data found</div>;

  const xpNeeded = xpForNextLevel(userData.level);
  const progress = (userData.xp / xpNeeded) * 100;
  const xpToNextLevel = xpNeeded - userData.xp;

  return (
    <Card variant="surface" className="p-4 backdrop-blur-md">
      <Flex direction="row" align="center">
        <Avatar size="3" src="" fallback={userData.user_id.substring(0, 2).toUpperCase()} />
        <Box ml="3" flexBasis="100%">
          <Heading size="5">Level {userData.level}</Heading>
          <Text size="3">{userData.xp} / {xpNeeded} XP ({xpToNextLevel} to next level)</Text>
          <ProgressBar value={progress} color="blue" className="mt-2" />
          <Flex gap="4" mt="2" justify="between">
            <Text size="2">Messages: {userData.total_messages || 0}</Text>
            <Text size="2">Posts: {userData.total_posts || 0}</Text>
            <Text size="2">Reactions: {userData.total_reactions || 0}</Text>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}