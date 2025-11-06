'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

/**
 * Badge Assignment Component
 * Per IMPLEMENTATION_PLAN.md Phase 3 Day 1-2
 * Allows admins to assign badges to users
 */

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface BadgeAssignmentProps {
  userId: string;
  experienceId: string;
  onAssigned?: () => void;
}

export function BadgeAssignment({ userId, experienceId, onAssigned }: BadgeAssignmentProps) {
  const { showSuccess, showError } = useNotification();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableBadges();
  }, [experienceId]);

  async function fetchAvailableBadges() {
    try {
      const response = await fetch(`/api/enterprise/badges?experienceId=${experienceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }

  async function handleAssignBadge() {
    if (!selectedBadge) {
      showError('Validation Error', 'Please select a badge');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/enterprise/userbadges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          badge_id: selectedBadge,
          experience_id: experienceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign badge');
      }

      showSuccess('Success', 'Badge assigned successfully!');
      setSelectedBadge('');
      onAssigned?.();
    } catch (error) {
      console.error('Error assigning badge:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to assign badge');
    } finally {
      setLoading(false);
    }
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No badges available. Create badges first in Badge Management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Badge to Assign
        </label>
        <select
          value={selectedBadge}
          onChange={(e) => setSelectedBadge(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a badge...</option>
          {badges.map((badge) => (
            <option key={badge.id} value={badge.id}>
              {badge.image_url} {badge.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAssignBadge}
        disabled={loading || !selectedBadge}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Assigning...' : 'Assign Badge'}
      </button>

      {selectedBadge && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {badges.find(b => b.id === selectedBadge) && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {badges.find(b => b.id === selectedBadge)?.image_url}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {badges.find(b => b.id === selectedBadge)?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {badges.find(b => b.id === selectedBadge)?.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
