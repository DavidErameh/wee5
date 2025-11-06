'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface XpConfigProps {
  experienceId: string;
}

interface XpConfiguration {
  xp_per_message?: number;
  min_xp_per_post?: number;
  max_xp_per_post?: number;
  xp_per_reaction?: number;
}

export function XpConfigurator({ experienceId }: XpConfigProps) {
  const [config, setConfig] = useState<XpConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchConfig();
  }, [experienceId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/xp-config?experienceId=${experienceId}`);
      const data = await response.json();
      
      if (response.ok) {
        setConfig(data.config);
      } else {
        showNotification({
          title: 'Error',
          message: data.error || 'Failed to fetch configuration'
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to fetch XP configuration'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const response = await fetch('/api/xp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experienceId, config }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: data.message
        });
      } else {
        showNotification({
          title: 'Error',
          message: data.error || 'Failed to save configuration'
        });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to save XP configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading configuration...</div>;
  }

  if (!config) {
    return (
      <div className="p-4 text-center text-gray-500">
        No configuration available. Premium tier required.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">XP Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            XP per Message
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={config.xp_per_message || ''}
            onChange={(e) => setConfig({
              ...config,
              xp_per_message: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min XP per Post
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={config.min_xp_per_post || ''}
              onChange={(e) => setConfig({
                ...config,
                min_xp_per_post: e.target.value ? parseInt(e.target.value) : undefined
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max XP per Post
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={config.max_xp_per_post || ''}
              onChange={(e) => setConfig({
                ...config,
                max_xp_per_post: e.target.value ? parseInt(e.target.value) : undefined
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            XP per Reaction
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={config.xp_per_reaction || ''}
            onChange={(e) => setConfig({
              ...config,
              xp_per_reaction: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}