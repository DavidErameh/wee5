
import { UpgradeButton } from '@/components/UpgradeButton/UpgradeButton';

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade to Premium</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Unlock Premium Features</h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Custom XP Rates</li>
          <li>Engagement Analytics</li>
          <li>Advanced Anti-Cheat</li>
          <li>Custom Badges</li>
          <li>Priority Support</li>
        </ul>
        <UpgradeButton />
      </div>
    </div>
  );
}
