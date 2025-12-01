import { Suspense } from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { UpgradeButton } from '@/components/UpgradeButton/UpgradeButton';
import { XpConfigurationForm } from '@/components/XpConfigurationForm/XpConfigurationForm';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Card, CardHeader, CardTitle, CardContent } from 'frosted-ui';
import { SettingsForm } from '@/components/SettingsForm/SettingsForm'; // Import SettingsForm

export default async function DashboardPage({ 
  params 
}: { 
  params: { companyId: string } 
}) {
  const { companyId } = await params;

  return (
    <div className="min-h-screen bg-black px-4 py-4 md:px-6 md:py-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">WEE5 Dashboard</h1>
            <p className="text-text-muted">Manage your community gamification</p>
          </div>
          <UpgradeButton experienceId={companyId} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>XP Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallback={
                <div className="h-32 bg-error/10 border border-error rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-error mb-2">Error Loading XP Configuration</h3>
                  <p className="text-error text-sm">There was an issue loading the XP configuration.</p>
                </div>
              }>
                <Suspense fallback={<div className="h-32 bg-dark-hover rounded-lg animate-pulse" />}>
                  <XpConfigurationForm experienceId={companyId} />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallback={
                <div className="h-96 bg-error/10 border border-error rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-error mb-2">Error Loading Analytics</h3>
                  <p className="text-error text-sm">There was an issue loading the analytics dashboard.</p>
                </div>
              }>
                <Suspense fallback={<div className="h-96 bg-dark-hover rounded-lg animate-pulse" />}>
                  <AnalyticsDashboard experienceId={companyId} />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12">
          <SettingsForm experienceId={companyId} />
        </div>
      </div>
    </div>
  );
}