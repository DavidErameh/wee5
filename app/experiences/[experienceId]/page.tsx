
import { UserProfileCard } from '@/components/UserProfileCard/UserProfileCard';
import { LeaderboardTable } from '@/components/LeaderboardTable/LeaderboardTable';
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
    <div className="min-h-screen bg-black px-4 py-4 md:px-6 md:py-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          WEE5 Leaderboard
        </h1>
        <p className="text-text-muted">
          Compete with other members and climb the ranks!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {userId && (
          <section className="md:col-span-12 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Your Progress
            </h2>
            <ErrorBoundary fallback={
              <div className="bg-error/10 border border-error rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-error mb-2">Error Loading Rank Card</h3>
                <p className="text-error">There was an issue loading your progress. Please try refreshing the page.</p>
              </div>
            }>
              <Suspense fallback={<div className="animate-pulse bg-dark-hover h-48 rounded-lg"></div>}>
                <RankCard userId={userId} experienceId={experienceId} />
              </Suspense>
            </ErrorBoundary>
          </section>
        )}

        <section className="md:col-span-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Top Players
          </h2>
          <ErrorBoundary fallback={
            <div className="bg-error/10 border border-error rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-error mb-2">Error Loading Leaderboard</h3>
              <p className="text-error">There was an issue loading the leaderboard. Please try refreshing the page.</p>
            </div>
          }>
            <Suspense fallback={<div className="animate-pulse bg-dark-hover h-96 rounded-lg"></div>}>
              <LeaderboardTable experienceId={experienceId} />
            </Suspense>
          </ErrorBoundary>
        </section>
      </div>
    </div>
  );
}
