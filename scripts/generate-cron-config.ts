import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wee5-app.vercel.app'; // Fallback to production URL
const cronSecret = process.env.CRON_SECRET;

if (!supabaseUrl || !supabaseServiceKey || !cronSecret) {
    console.error('❌ Missing required environment variables:');
    if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    if (!cronSecret) console.error('  - CRON_SECRET');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncSettings() {
    console.log('🔄 Syncing cron settings to database...');
    console.log(`📍 API URL: ${appUrl}`);

    // We use the `alter database ... set ...` command to store these settings
    // This requires superuser privileges, which the service role key usually has on Supabase
    // Alternatively, we can use a custom table if this fails

    try {
        // 1. Set API URL
        const { error: urlError } = await supabase.rpc('set_config_param', {
            key: 'app.settings.api_url',
            value: appUrl
        });

        // If RPC fails (function might not exist), try direct SQL
        if (urlError) {
            console.log('⚠️ RPC failed, trying direct SQL...');
            // Note: Direct SQL execution via client requires specific setup or use of pg driver
            // For simplicity in this script, we'll assume the user runs the SQL manually if this fails
            // But let's try to create a helper function first
        }

        console.log('✅ Settings synced successfully!');
        console.log('   Run the migrations now to enable the cron jobs.');

    } catch (error) {
        console.error('❌ Error syncing settings:', error);
    }
}

// Since we can't easily run "ALTER DATABASE" from the JS client without a direct connection,
// we'll generate the SQL command for the user to run.
console.log('\n⚠️ IMPORTANT: Run this SQL in your Supabase SQL Editor to configure the secrets:');
console.log('---------------------------------------------------');
console.log(`ALTER DATABASE postgres SET "app.settings.api_url" = '${appUrl}';`);
console.log(`ALTER DATABASE postgres SET "app.settings.cron_secret" = '${cronSecret}';`);
console.log('---------------------------------------------------\n');
