'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

interface SettingsFormProps {
  experienceId: string;
  initialSettings?: {
    enable_leaderboard?: boolean;
    enable_notifications?: boolean;
    enable_anti_cheat?: boolean;
  };
  className?: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  experienceId,
  initialSettings = {},
  className,
}) => {
  const [settings, setSettings] = useState({
    enable_leaderboard: initialSettings.enable_leaderboard ?? true,
    enable_notifications: initialSettings.enable_notifications ?? true,
    enable_anti_cheat: initialSettings.enable_anti_cheat ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prevSettings) => ({ ...prevSettings, [key]: value }));
    setSuccess(false); // Reset success message on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // In a real application, you would send `settings` to your backend API
      console.log('Saving settings for experienceId:', experienceId, settings);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className={cn('bg-dark rounded-xl border border-border p-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold text-white mb-6">Community Settings</h2>

      <form onSubmit={handleSubmit} aria-label="Community Settings Form">
        <div className="space-y-6">
          {/* Enable Leaderboard Toggle */}
          <ToggleSwitch
            id="enable-leaderboard"
            label="Enable Leaderboard"
            checked={settings.enable_leaderboard}
            onChange={(value) => handleChange('enable_leaderboard', value)}
          />

          {/* Enable Notifications Toggle */}
          <ToggleSwitch
            id="enable-notifications"
            label="Enable Notifications"
            checked={settings.enable_notifications}
            onChange={(value) => handleChange('enable_notifications', value)}
          />

          {/* Enable Anti-Cheat Toggle */}
          <ToggleSwitch
            id="enable-anti-cheat"
            label="Enable Anti-Cheat"
            checked={settings.enable_anti_cheat}
            onChange={(value) => handleChange('enable_anti_cheat', value)}
          />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black active:scale-98',
              'bg-accent hover:bg-accent-light text-white transition-all duration-150',
              saving ? 'opacity-70 cursor-not-allowed' : ''
            )}
            aria-label={saving ? "Saving settings" : "Save community settings"}
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" aria-hidden="true" />
                <span>Save Settings</span>
              </>
            )}
          </button>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-success flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Settings saved successfully!
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-error flex items-center justify-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  );
};

SettingsForm.displayName = 'SettingsForm';

export default SettingsForm;
