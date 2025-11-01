import { supabaseAdmin } from './db';

// Default XP values
export const DEFAULT_XP_VALUES = {
  message: 20,
  post: { min: 15, max: 25 }, // Range for posts
  reaction: 5,
};

// Get XP configuration for a specific experience/community
export async function getXpConfiguration(experienceId: string) {
  try {
    // First, try to get custom configuration from the database
    const { data, error } = await supabaseAdmin
      .from('xp_configurations')
      .select('*')
      .eq('experience_id', experienceId)
      .single();

    if (error || !data) {
      // Return default configuration if no custom config exists
      return DEFAULT_XP_VALUES;
    }

    return {
      message: data.xp_per_message || DEFAULT_XP_VALUES.message,
      post: {
        min: data.min_xp_per_post || DEFAULT_XP_VALUES.post.min,
        max: data.max_xp_per_post || DEFAULT_XP_VALUES.post.max,
      },
      reaction: data.xp_per_reaction || DEFAULT_XP_VALUES.reaction,
    };
  } catch (error) {
    console.error('Error fetching XP configuration:', error);
    return DEFAULT_XP_VALUES;
  }
}

// Update XP configuration for an experience (for premium users)
export async function updateXpConfiguration(
  experienceId: string,
  config: {
    xp_per_message?: number;
    min_xp_per_post?: number;
    max_xp_per_post?: number;
    xp_per_reaction?: number;
  }
) {
  try {
    // Check if configuration already exists
    const { data: existingConfig } = await supabaseAdmin
      .from('xp_configurations')
      .select('id')
      .eq('experience_id', experienceId)
      .single();

    let result;
    if (existingConfig) {
      // Update existing configuration
      result = await supabaseAdmin
        .from('xp_configurations')
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq('experience_id', experienceId);
    } else {
      // Create new configuration
      result = await supabaseAdmin
        .from('xp_configurations')
        .insert({
          experience_id: experienceId,
          ...config,
          created_at: new Date().toISOString(),
        });
    }

    return result;
  } catch (error) {
    console.error('Error updating XP configuration:', error);
    throw error;
  }
}