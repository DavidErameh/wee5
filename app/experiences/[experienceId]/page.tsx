import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import LeaderboardTable from "@/components/LeaderboardTable/LeaderboardTable";
import { UserRankCard } from "@/components/UserRankCard/UserRankCard";
import { ActivityFeed } from "@/components/ActivityFeed/ActivityFeed";

interface PageProps {
  params: Promise<{ experienceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExperiencePage({ params, searchParams }: PageProps) {
  const { experienceId } = await params;
  const user = await getCurrentUser();

  // In a real app, we might check if the user has access to this experience here

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Section: User Rank Card */}
        {user && (
          <section>
            <UserRankCard userId={user.userId} experienceId={experienceId} />
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[800px]">

          {/* Left Column: Leaderboard (Takes up 2/3 space on large screens) */}
          <section className="lg:col-span-2 h-full min-h-[500px]">
            <LeaderboardTable
              experienceId={experienceId}
              currentUserId={user?.userId}
              className="h-full"
            />
          </section>

          {/* Right Column: Activity Feed (Takes up 1/3 space) */}
          <section className="h-full min-h-[500px]">
            <ActivityFeed experienceId={experienceId} />
          </section>
        </div>
      </div>
    </div>
  );
}
