import { Suspense } from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { XpConfigurator } from '@/components/XpConfigurator';
import { UpgradeButton } from '@/components/UpgradeButton';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default async function DashboardPage({ 
  params 
}: { 
  params: { companyId: string } 
}) {
  const { companyId } = await params;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WEE5 Dashboard</h1>
            <p className="text-gray-600">Manage your community gamification</p>
          </div>
          <UpgradeButton experienceId={companyId} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">XP Configuration</h2>
            <ErrorBoundary fallback={
              <div className="h-32 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading XP Configuration</h3>
                <p className="text-red-600 text-sm">There was an issue loading the XP configuration.</p>
              </div>
            }>
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
                <XpConfigurator experienceId={companyId} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <ErrorBoundary fallback={
              <div className="h-96 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
                <p className="text-red-600 text-sm">There was an issue loading the analytics dashboard.</p>
              </div>
            }>
              <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}>
                <AnalyticsDashboard experienceId={companyId} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Community Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Anti-Cheat Settings</h3>
            <p className="text-sm text-gray-600">Configure activity monitoring and spam detection</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Reward Configuration</h3>
            <p className="text-sm text-gray-600">Customize level-up rewards and bonuses</p>
          </div>
        </div>
      </div>
    </div>
  );
}