import { NextResponse } from 'next/server';
import { processActivityEvent } from '@/lib/event-processor';
import { ActivityType } from '@/lib/xp-logic';
import { supabaseAdmin } from '@/lib/db';

// This route should be called by Vercel Cron (configured in vercel.json)
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get last poll time from database
    const lastPollTime = await getLastPollTime();
    const currentTime = Date.now();

    console.log(`Polling for activities since: ${new Date(lastPollTime).toISOString()}`);

    // In a real implementation, we would make API calls to Whop to fetch recent activities
    // For now, let's implement a more realistic polling function that would call Whop APIs
    const pollResults = await pollWhopActivities(lastPollTime);

    // Process forum posts
    for (const post of pollResults.forumPosts) {
      await processActivityEvent({
        type: 'post' as ActivityType,
        userId: post.user_id,
        experienceId: post.experience_id,
        companyId: post.company_id,
        content: post.content,
        timestamp: post.created_at,
      });
    }

    // Process chat messages
    for (const message of pollResults.chatMessages) {
      await processActivityEvent({
        type: 'message' as ActivityType,
        userId: message.user_id,
        experienceId: message.experience_id,
        companyId: message.company_id,
        content: message.content,
        timestamp: message.created_at,
      });
    }

    // Process reactions
    for (const reaction of pollResults.reactions) {
      await processActivityEvent({
        type: 'reaction' as ActivityType,
        userId: reaction.user_id,
        experienceId: reaction.experience_id,
        companyId: reaction.company_id,
        timestamp: reaction.created_at,
      });
    }

    // Update last poll time
    await saveLastPollTime(currentTime);

    return NextResponse.json({
      success: true,
      processed: {
        forumPosts: pollResults.forumPosts.length,
        chatMessages: pollResults.chatMessages.length,
        reactions: pollResults.reactions.length,
      },
      lastPollTime: new Date(lastPollTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
    });
  } catch (error) {
    console.error('Polling error:', error);
    return NextResponse.json({
      error: 'Polling failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Function to poll Whop API for recent activities
// This would be replaced with actual Whop API calls
async function pollWhopActivities(since: number): Promise<{
  forumPosts: Array<{ user_id: string; experience_id: string; company_id: string; content: string; created_at: number }>;
  chatMessages: Array<{ user_id: string; experience_id: string; company_id: string; content: string; created_at: number }>;
  reactions: Array<{ user_id: string; experience_id: string; company_id: string; created_at: number }>;
}> {
  console.log(`Making API calls to fetch activities since ${new Date(since).toISOString()}`);
  
  // In a real implementation, this would call the Whop API to fetch recent activities
  // The actual implementation would depend on the available Whop API endpoints
  // This is a placeholder showing the intended structure
  
  try {
    // This is where you would make actual API calls using the Whop SDK
    // Example (theoretical) calls:
    // const forumPosts = await whopClient.experiences.getRecentPosts({ 
    //   since: new Date(since).toISOString() 
    // });
    // const chatMessages = await whopClient.experiences.getRecentMessages({ 
    //   since: new Date(since).toISOString() 
    // });
    // const reactions = await whopClient.experiences.getRecentReactions({ 
    //   since: new Date(since).toISOString() 
    // });
    
    // For now, returning empty arrays as we don't have the actual API endpoints
    // In real implementation, these would contain actual data from Whop
    return {
      forumPosts: [],
      chatMessages: [],
      reactions: [],
    };
  } catch (error) {
    console.error('Error polling Whop API:', error);
    // Return empty arrays but log the error
    return {
      forumPosts: [],
      chatMessages: [],
      reactions: [],
    };
  }
}

// Get the last poll time from database
async function getLastPollTime(): Promise<number> {
  try {
    // Query the database for the last poll timestamp for this cron job
    // We'll create a table for cron logs if needed
    const { data, error } = await supabaseAdmin()
      .from('cron_logs')
      .select('last_executed')
      .eq('job_name', 'poll_activities')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        // If no record exists, use 1 minute ago as default
        // This prevents processing a massive amount of historical data on first run
        return Date.now() - 60000;
      }
      console.error('Error fetching last poll time:', error);
      // Default to 1 minute ago if there's an error
      return Date.now() - 60000;
    }

    if (data && data.last_executed) {
      return new Date(data.last_executed).getTime();
    }

    // Default to 1 minute ago if no timestamp found
    return Date.now() - 60000;
  } catch (error) {
    console.error('Database error getting last poll time:', error);
    return Date.now() - 60000;
  }
}

// Save the current poll time to database
async function saveLastPollTime(timestamp: number): Promise<void> {
  try {
    const timestampISO = new Date(timestamp).toISOString();
    
    // Insert or update the cron log record to track when we last polled
    const { error } = await supabaseAdmin()
      .from('cron_logs')
      .upsert({
        job_name: 'poll_activities',
        last_executed: timestampISO,
        updated_at: timestampISO,
      }, { onConflict: 'job_name' });

    if (error) {
      console.error('Error saving poll time:', error);
      throw error;
    }

    console.log(`Poll time saved: ${timestampISO}`);
  } catch (error) {
    console.error('Database error saving poll time:', error);
    throw error;
  }
}