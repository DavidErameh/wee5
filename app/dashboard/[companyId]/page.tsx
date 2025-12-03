import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { XPSettings } from "@/components/dashboard/XPSettings";
import { RewardConfig } from "@/components/dashboard/RewardConfig";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { companyId } = await params;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-text-muted">Manage your community's gamification settings</p>
        </header>

        {/* Analytics Section */}
        <section>
          <AnalyticsOverview />
        </section>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <XPSettings />
          </section>

          <section>
            <RewardConfig />
          </section>
        </div>
      </div>
    </div>
  );
}