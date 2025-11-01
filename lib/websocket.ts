
import { whopsdk } from './whop-sdk';
import { awardXP } from './xp-logic';
import { handleLevelUp } from './rewards';
import { supabaseAdmin } from './db';

// Update analytics for the current date
async function updateAnalytics(experienceId: string, activityType: 'message' | 'post' | 'reaction', xpEarned: number = 0) {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  try {
    // Check if record already exists for today
    const { data: existingRecord, error: selectError } = await supabaseAdmin
      .from('engagement_analytics')
      .select('id, messages_sent, posts_created, reactions_given, total_users_active, total_xp_earned')
      .eq('experience_id', experienceId)
      .eq('date', today)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw selectError;
    }

    const updates: any = {};
    if (activityType === 'message') {
      updates.messages_sent = (existingRecord?.messages_sent || 0) + 1;
    } else if (activityType === 'post') {
      updates.posts_created = (existingRecord?.posts_created || 0) + 1;
    } else if (activityType === 'reaction') {
      updates.reactions_given = (existingRecord?.reactions_given || 0) + 1;
    }

    // Add the XP earned to the total
    updates.total_xp_earned = (existingRecord?.total_xp_earned || 0) + xpEarned;

    // Always increment total active users (with deduplication handled outside)
    updates.total_users_active = (existingRecord?.total_users_active || 0) + 1;

    if (existingRecord) {
      // Update existing record
      await supabaseAdmin
        .from('engagement_analytics')
        .update(updates)
        .eq('id', existingRecord.id);
    } else {
      // Create new record
      await supabaseAdmin
        .from('engagement_analytics')
        .insert({
          experience_id: experienceId,
          date: today,
          [activityType === 'message' ? 'messages_sent' : 
           activityType === 'post' ? 'posts_created' : 
           'reactions_given']: 1,
          total_xp_earned: xpEarned,
          total_users_active: 1,
        });
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

// Initialize websocket for a specific user
export function initializeWebsocket(userId: string) {
  const websocket = whopsdk
    .withUser(userId)
    .websockets.client();

  // Listen for messages
  websocket.on('message', async (message) => {
    const chatMessage = message.feedEntity?.dmsPost;
    const forumPost = message.feedEntity?.forumPost;
    const reaction = message.feedEntity?.reaction;

    if (chatMessage) {
      const result = await awardXP(
        chatMessage.user_id,
        chatMessage.experience_id,
        'message'
      );
      
      if (result.success) {
        if (result.leveledUp) {
          await handleLevelUp(chatMessage.user_id, result.newLevel!);
          // Update analytics for level achieved
          const today = new Date().toISOString().split('T')[0];
          try {
            await supabaseAdmin
              .from('engagement_analytics')
              .upsert({
                experience_id: chatMessage.experience_id,
                date: today,
                new_levels_achieved: 1,
                total_users_active: 1, // Count user as active for this event
              }, {
                onConflict: 'experience_id,date'
              });
          } catch (error) {
            console.error('Error updating level achievement analytics:', error);
          }
        }
        
        // Update engagement analytics with XP earned
        await updateAnalytics(chatMessage.experience_id, 'message', result.xpAwarded || 0);
      }
    }

    if (forumPost) {
      const result = await awardXP(
        forumPost.user_id,
        forumPost.experience_id,
        'post'
      );
      
      if (result.success) {
        if (result.leveledUp) {
          await handleLevelUp(forumPost.user_id, result.newLevel!);
          // Update analytics for level achieved
          const today = new Date().toISOString().split('T')[0];
          try {
            await supabaseAdmin
              .from('engagement_analytics')
              .upsert({
                experience_id: forumPost.experience_id,
                date: today,
                new_levels_achieved: 1,
                total_users_active: 1, // Count user as active for this event
              }, {
                onConflict: 'experience_id,date'
              });
          } catch (error) {
            console.error('Error updating level achievement analytics:', error);
          }
        }
        
        // Update engagement analytics with XP earned
        await updateAnalytics(forumPost.experience_id, 'post', result.xpAwarded || 0);
      }
    }

    if (reaction) {
      const result = await awardXP(
        reaction.user_id,
        reaction.experience_id,
        'reaction'
      );
      
      if (result.success) {
        if (result.leveledUp) {
          await handleLevelUp(reaction.user_id, result.newLevel!);
          // Update analytics for level achieved
          const today = new Date().toISOString().split('T')[0];
          try {
            await supabaseAdmin
              .from('engagement_analytics')
              .upsert({
                experience_id: reaction.experience_id,
                date: today,
                new_levels_achieved: 1,
                total_users_active: 1, // Count user as active for this event
              }, {
                onConflict: 'experience_id,date'
              });
          } catch (error) {
            console.error('Error updating level achievement analytics:', error);
          }
        }
        
        // Update engagement analytics with XP earned
        await updateAnalytics(reaction.experience_id, 'reaction', result.xpAwarded || 0);
      }
    }
  });

  websocket.on('connectionStatus', (status) => {
    console.log('Websocket status:', status);
  });

  websocket.connect();

  return websocket;
}
