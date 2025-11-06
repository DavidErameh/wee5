
import { RankCard } from '@/components/RankCard';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: { experienceId: string };
  searchParams: { userId?: string };
}) {
  const { experienceId } = await params;
  const userId = searchParams.userId;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          WEE5 Leaderboard
        </h1>
        <p className="text-gray-600">
          Compete with other members and climb the ranks!
        </p>
      </header>

      {userId && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Progress
          </h2>
          <ErrorBoundary fallback={
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Rank Card</h3>
              <p className="text-red-600">There was an issue loading your progress. Please try refreshing the page.</p>
            </div>
          }>
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
              <RankCard userId={userId} experienceId={experienceId} />
            </Suspense>
          </ErrorBoundary>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Top Players
        </h2>
        <ErrorBoundary fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Leaderboard</h3>
            <p className="text-red-600">There was an issue loading the leaderboard. Please try refreshing the page.</p>
          </div>
        }>
          <Suspense fallback={<div className="animate-pulse bg-white h-96 rounded-lg"></div>}>
            <LeaderboardTable experienceId={experienceId} />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  );
}
