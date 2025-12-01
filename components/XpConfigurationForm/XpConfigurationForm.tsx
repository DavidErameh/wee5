"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Define Zod schema for XP configuration
const xpConfigSchema = z.object({
  xp_per_message: z.number().int().min(0).max(1000).optional().nullable(),
  min_xp_per_post: z.number().int().min(0).max(1000).optional().nullable(),
  max_xp_per_post: z.number().int().min(0).max(1000).optional().nullable(),
  xp_per_reaction: z.number().int().min(0).max(1000).optional().nullable(),
}).refine((data) => {
  if (data.min_xp_per_post !== undefined && data.max_xp_per_post !== undefined && data.min_xp_per_post !== null && data.max_xp_per_post !== null) {
    return data.min_xp_per_post <= data.max_xp_per_post;
  }
  return true;
}, {
  message: "Min XP per post cannot be greater than Max XP per post",
  path: ["min_xp_per_post"], // This error will be associated with min_xp_per_post field
});

type XpConfiguration = z.infer<typeof xpConfigSchema>;

interface XpConfigurationFormProps {
  experienceId: string;
  initialConfig?: XpConfiguration;
  className?: string;
}

export const XpConfigurationForm: React.FC<XpConfigurationFormProps> = ({
  experienceId,
  initialConfig = {},
  className,
}) => {
  const [config, setConfig] = useState<XpConfiguration>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showNotification } = useNotification();

  // Load initial config if provided
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleChange = (field: keyof XpConfiguration, value: string) => {
    const numValue = value === '' ? null : Number(value); // Use null for empty input

    setConfig(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const validationResult = xpConfigSchema.safeParse(config);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path.length > 0) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      }
      setErrors(fieldErrors);
      showNotification({
        title: 'Validation Error',
        message: 'Please correct the highlighted fields.',
        type: 'error',
      });
      return;
    }

    setErrors({}); // Clear previous errors

    try {
      setSaving(true);
      const response = await fetch('/api/xp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          experienceId, 
          config: validationResult.data, // Use validated data
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: data.message || 'Configuration saved successfully!',
          type: 'success'
        });
      } else {
        throw new Error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showNotification({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save XP configuration',
        type: 'error'
      });
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
      <h2 className="text-xl font-bold text-white mb-6">XP Configuration</h2>
      
      <form onSubmit={handleSubmit} aria-label="XP Configuration Form">
        <div className="space-y-6">
          {/* Message XP Setting */}
          <div>
            <label htmlFor="xp_per_message" className="block text-sm font-medium text-text-muted mb-2">
              XP per Message
            </label>
            <div className="relative">
              <input
                id="xp_per_message"
                type="number"
                min="0"
                max="1000"
                value={config.xp_per_message ?? ''}
                onChange={(e) => handleChange('xp_per_message', e.target.value)}
                className={cn(
                  'w-full p-3 bg-dark-hover border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
                  errors.xp_per_message ? 'border-error focus:ring-error focus:ring-offset-2 focus:ring-offset-black' : 'border-border focus:ring-accent focus:border-accent focus:ring-offset-2 focus:ring-offset-black'
                )}
                placeholder="20"
                aria-describedby={errors.xp_per_message ? "xp-message-error" : undefined}
              />
              {errors.xp_per_message && (
                <div id="xp-message-error" role="alert" aria-live="assertive" className="flex items-center mt-2 text-error">
                  <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span className="text-sm">{errors.xp_per_message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Post XP Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="min_xp_per_post" className="block text-sm font-medium text-text-muted mb-2">
                Min XP per Post
              </label>
              <div className="relative">
                <input
                  id="min_xp_per_post"
                  type="number"
                  min="0"
                  max="1000"
                  value={config.min_xp_per_post ?? ''}
                  onChange={(e) => handleChange('min_xp_per_post', e.target.value)}
                  className={cn(
                    'w-full p-3 bg-dark-hover border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
                    errors.min_xp_per_post ? 'border-error focus:ring-error focus:ring-offset-2 focus:ring-offset-black' : 'border-border focus:ring-accent focus:border-accent focus:ring-offset-2 focus:ring-offset-black'
                  )}
                  placeholder="15"
                  aria-describedby={errors.min_xp_per_post ? "min-post-xp-error" : undefined}
                />
                {errors.min_xp_per_post && (
                  <div id="min-post-xp-error" role="alert" aria-live="assertive" className="flex items-center mt-2 text-error">
                    <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span className="text-sm">{errors.min_xp_per_post}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="max_xp_per_post" className="block text-sm font-medium text-text-muted mb-2">
                Max XP per Post
              </label>
              <div className="relative">
                <input
                  id="max_xp_per_post"
                  type="number"
                  min="0"
                  max="1000"
                  value={config.max_xp_per_post ?? ''}
                  onChange={(e) => handleChange('max_xp_per_post', e.target.value)}
                  className={cn(
                    'w-full p-3 bg-dark-hover border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
                    errors.max_xp_per_post ? 'border-error focus:ring-error focus:ring-offset-2 focus:ring-offset-black' : 'border-border focus:ring-accent focus:border-accent focus:ring-offset-2 focus:ring-offset-black'
                  )}
                  placeholder="25"
                  aria-describedby={errors.max_xp_per_post ? "max-post-xp-error" : undefined}
                />
                {errors.max_xp_per_post && (
                  <div id="max-post-xp-error" role="alert" aria-live="assertive" className="flex items-center mt-2 text-error">
                    <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span className="text-sm">{errors.max_xp_per_post}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reaction XP Setting */}
          <div>
            <label htmlFor="xp_per_reaction" className="block text-sm font-medium text-text-muted mb-2">
              XP per Reaction
            </label>
            <div className="relative">
              <input
                id="xp_per_reaction"
                type="number"
                min="0"
                max="1000"
                value={config.xp_per_reaction ?? ''}
                onChange={(e) => handleChange('xp_per_reaction', e.target.value)}
                className={cn(
                  'w-full p-3 bg-dark-hover border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-1',
                  errors.xp_per_reaction ? 'border-error focus:ring-error' : 'border-border focus:ring-accent focus:border-accent'
                )}
                placeholder="5"
                aria-describedby={errors.xp_per_reaction ? "xp-reaction-error" : undefined}
              />
              {errors.xp_per_reaction && (
                <div id="xp-reaction-error" role="alert" aria-live="assertive" className="flex items-center mt-2 text-error">
                  <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span className="text-sm">{errors.xp_per_reaction}</span>
                </div>
              )}
            </div>
          </div>
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
            aria-label={saving ? "Saving configuration" : "Save XP configuration"}
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" aria-hidden="true" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

XpConfigurationForm.displayName = 'XpConfigurationForm';

export default XpConfigurationForm;