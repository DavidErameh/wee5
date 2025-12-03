import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { whopSdk } from '@/lib/whop-sdk';

// This route is called by external cron service to send welcome emails
export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Allow either Bearer token or query param
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('Starting welcome email check...');

        // 1. Get users who haven't received a welcome email yet
        // We assume there's a 'welcome_email_sent' flag in the users table
        // If not, we might need to add it or use a different logic
        const { data: newUsers, error } = await supabaseAdmin()
            .from('users')
            .select('*')
            .is('welcome_email_sent', false) // or null
            .limit(50); // Process in batches

        if (error) {
            console.error('Error fetching new users:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!newUsers || newUsers.length === 0) {
            return NextResponse.json({ message: 'No new users to process' });
        }

        console.log(`Found ${newUsers.length} new users to welcome`);

        const results = {
            success: 0,
            failed: 0,
        };

        // 2. Send welcome emails
        for (const user of newUsers) {
            try {
                // Fetch user email from Whop if not in DB
                // const whopUser = await whopSdk.users.get({ id: user.user_id });
                // const email = whopUser.email;

                // Send email logic here (e.g. using Resend, SendGrid, or Whop notifications)
                // For now, we'll just log it and mark as sent
                console.log(`Sending welcome email to user ${user.user_id}`);

                // Mark as sent
                const { error: updateError } = await supabaseAdmin()
                    .from('users')
                    .update({ welcome_email_sent: true })
                    .eq('user_id', user.user_id);

                if (updateError) throw updateError;

                results.success++;
            } catch (err) {
                console.error(`Failed to process user ${user.user_id}:`, err);
                results.failed++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: newUsers.length,
            results
        });

    } catch (error) {
        console.error('Welcome email cron error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
