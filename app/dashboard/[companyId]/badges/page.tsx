'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';

/**
 * Badge Management Page
 * Per IMPLEMENTATION_PLAN.md Phase 3 Day 1-2
 * Allows enterprise users to create and manage custom badges
 */

interface Badge {
  id: string;
  experience_id: string;
  name: string;
  description: string;
  image_url: string;
  criteria?: any;
  created_at: string;
}

export default function BadgesPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const { showSuccess, showError } = useNotification();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });

  // Fetch badges
  useEffect(() => {
    fetchBadges();
  }, [companyId]);

  async function fetchBadges() {
    try {
      setLoading(true);
      const response = await fetch(`/api/enterprise/badges?experienceId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      showError('Error', 'Failed to load badges');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBadge(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      showError('Validation Error', 'Name and description are required');
      return;
    }

    try {
      const response = await fetch('/api/enterprise/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience_id: companyId,
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url || '🏆',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create badge');
      }

      showSuccess('Success', 'Badge created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', image_url: '' });
      fetchBadges();
    } catch (error) {
      console.error('Error creating badge:', error);
      showError('Error', 'Failed to create badge');
    }
  }

  async function handleDeleteBadge(badgeId: string) {
    if (!confirm('Are you sure you want to delete this badge?')) {
      return;
    }

    try {
      const response = await fetch(`/api/enterprise/badges?badgeId=${badgeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete badge');
      }

      showSuccess('Success', 'Badge deleted successfully!');
      fetchBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
      showError('Error', 'Failed to delete badge');
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading badges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Badge Management</h1>
            <p className="text-gray-600 mt-2">Create and manage custom badges for your community</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Create Badge
          </button>
        </div>

        {/* Badges Grid */}
        {badges.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600 mb-4">Create your first custom badge to reward your community members</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Create Your First Badge
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div key={badge.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{badge.image_url}</div>
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                <div className="text-xs text-gray-500">
                  Created {new Date(badge.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Badge Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Badge</h2>
              <form onSubmit={handleCreateBadge}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Top Contributor"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this badge represents..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon/Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="🏆 (emoji or image URL)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use an emoji or provide an image URL
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', description: '', image_url: '' });
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Create Badge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
