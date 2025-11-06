/**
 * Reaction Polling Fallback System
 * Per Documentation: 01_START HERE.MD, 03_CORE FEATURE.MD
 * 
 * Since reactions are not available in Whop's WebSocket events,
 * this implements a polling fallback to detect and award XP for reactions.
 * 
 * Polling is only enabled if ENABLE_REACTION_POLLING=true in environment.
 */

import { whopClient } from './whop-sdk';
import { awardXP } from './xp-logic';

// Polling configuration
const POLL_INTERVAL = 30000; // 30 seconds (to respect rate limits)
const MAX_REACTIONS_PER_POLL = 100;

// Track processed reactions to avoid duplicates
const processedReactions = new Set<string>();
let pollingInterval: NodeJS.Timeout | null = null;

interface Reaction {
  id: string;
  user_id: string;
  experience_id: string;
  post_id?: string;
  message_id?: string;
  reaction_type: string;
  created_at: string;
}

/**
 * Start reaction polling service
 * Only runs if ENABLE_REACTION_POLLING=true
 */
export function startReactionPolling() {
  const enabled = process.env.ENABLE_REACTION_POLLING === 'true';

  if (!enabled) {
    console.log('ℹ️ Reaction polling disabled (set ENABLE_REACTION_POLLING=true to enable)');
    return;
  }

  if (pollingInterval) {
    console.log('⚠️ Reaction polling already running');
    return;
  }

  console.log('🔄 Starting reaction polling service...');
  console.log(`📊 Polling interval: ${POLL_INTERVAL / 1000}s`);

  // Start polling
  pollingInterval = setInterval(pollReactions, POLL_INTERVAL);

  // Run immediately on start
  pollReactions();
}

/**
 * Stop reaction polling service
 */
export function stopReactionPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('🛑 Reaction polling stopped');
  }
}

/**
 * Poll for new reactions and award XP
 */
async function pollReactions() {
  try {
    console.log('🔍 Polling for new reactions...');

    // Fetch recent reactions from Whop API
    // Note: Exact endpoint may vary - adjust based on actual Whop API
    const reactions = await fetchRecentReactions();

    if (!reactions || reactions.length === 0) {
      console.log('ℹ️ No new reactions found');
      return;
    }

    console.log(`📨 Found ${reactions.length} reactions to process`);

    // Process each reaction
    for (const reaction of reactions) {
      await processReaction(reaction);
    }

    console.log('✅ Reaction polling complete');
  } catch (error) {
    console.error('❌ Error polling reactions:', error);
  }
}

/**
 * Fetch recent reactions from Whop API
 * This is a placeholder - adjust based on actual Whop API endpoints
 */
async function fetchRecentReactions(): Promise<Reaction[]> {
  try {
    // TODO: Replace with actual Whop API endpoint when available
    // Example: GET /v5/company/reactions?since=timestamp
    
    // For now, return empty array
    // When Whop API is available, use:
    // const response = await whopClient.reactions.list({
    //   limit: MAX_REACTIONS_PER_POLL,
    //   since: getLastPollTimestamp(),
    // });
    // return response.data || [];

    return [];
  } catch (error) {
    console.error('❌ Error fetching reactions:', error);
    return [];
  }
}

/**
 * Process a single reaction and award XP
 */
async function processReaction(reaction: Reaction) {
  // Skip if already processed
  if (processedReactions.has(reaction.id)) {
    return;
  }

  try {
    // Award XP for reaction (5 XP)
    const result = await awardXP({
      userId: reaction.user_id,
      experienceId: reaction.experience_id,
      activityType: 'reaction',
    });

    if (result.success) {
      console.log(`✅ Awarded ${result.xpAwarded} XP to ${reaction.user_id} for reaction`);
      
      if (result.leveledUp) {
        console.log(`🎉 User ${reaction.user_id} leveled up to ${result.newLevel}!`);
      }

      // Mark as processed
      processedReactions.add(reaction.id);

      // Clean up old processed IDs (keep last 1000)
      if (processedReactions.size > 1000) {
        const idsToRemove = Array.from(processedReactions).slice(0, 100);
        idsToRemove.forEach(id => processedReactions.delete(id));
      }
    } else {
      console.log(`⏳ User ${reaction.user_id} on cooldown, skipping XP award`);
    }
  } catch (error) {
    console.error(`❌ Error processing reaction ${reaction.id}:`, error);
  }
}

/**
 * Get last poll timestamp for incremental polling
 */
function getLastPollTimestamp(): string {
  // Return timestamp from 1 minute ago to catch recent reactions
  const oneMinuteAgo = new Date(Date.now() - 60000);
  return oneMinuteAgo.toISOString();
}

/**
 * Get polling status
 */
export function getPollingStatus(): {
  enabled: boolean;
  running: boolean;
  processedCount: number;
} {
  return {
    enabled: process.env.ENABLE_REACTION_POLLING === 'true',
    running: pollingInterval !== null,
    processedCount: processedReactions.size,
  };
}

// Auto-start on module load (server-side only)
if (typeof window === 'undefined') {
  startReactionPolling();
}

export default {
  start: startReactionPolling,
  stop: stopReactionPolling,
  getStatus: getPollingStatus,
};
