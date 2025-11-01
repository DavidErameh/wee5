import { RankCard } from '@/components/RankCard';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { Box, Flex, Heading } from 'frosted-ui';
import { supabaseAdmin } from '@/lib/db';
import { UpgradeButton } from '@/components/UpgradeButton';
import { WebSocketProvider } from '@/components/WebSocketProvider';

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: { experienceId: string };
  searchParams: { userId?: string };
}) {
  const { experienceId } = params;
  const userId = searchParams.userId;

  let userTier = 'free';
  if (userId) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('tier')
      .eq('user_id', userId)
      .single();
    if (user) {
      userTier = user.tier;
    }
  }

  return (
    <Box className="min-h-screen bg-gray-2 p-6">
      {userId && <WebSocketProvider userId={userId} />}
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="8">WEE5 Leaderboard</Heading>
        {userTier === 'free' && <UpgradeButton />}
      </Flex>

      {userId && (
        <Box className="mb-8">
          <Heading size="6" className="mb-4">Your Rank</Heading>
          <RankCard userId={userId} experienceId={experienceId} />
        </Box>
      )}

      <Box>
        <Heading size="6" className="mb-4">Top Players</Heading>
        <LeaderboardTable experienceId={experienceId} />
      </Box>
    </Box>
  );
}