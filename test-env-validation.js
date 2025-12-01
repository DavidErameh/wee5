// Simple environment validation script
require('dotenv').config({ path: '.env.local' });

const REQUIRED_ENV_VARS = [
  'WHOP_API_KEY',
  'WHOP_APP_ID',
  'WHOP_AGENT_USER_ID',
  'NEXT_PUBLIC_WHOP_APP_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

console.log('═══════════════════════════════════════');
console.log('  WEE5 Environment Validation');
console.log('═══════════════════════════════════════\n');

let allValid = true;
const missing = [];
const invalid = [];

for (const envVar of REQUIRED_ENV_VARS) {
  const value = process.env[envVar];
  
  if (!value) {
    allValid = false;
    missing.push(envVar);
    console.error(`❌ Missing: ${envVar}`);
  } else {
    // Validate format for specific variables
    if (envVar === 'WHOP_AGENT_USER_ID' && !value.startsWith('user_')) {
      allValid = false;
      invalid.push(`${envVar} (must start with 'user_')`);
      console.error(`❌ Invalid format: ${envVar} (must start with 'user_')`);
    } else if ((envVar === 'WHOP_APP_ID' || envVar === 'NEXT_PUBLIC_WHOP_APP_ID') && !value.startsWith('app_')) {
      allValid = false;
      invalid.push(`${envVar} (must start with 'app_')`);
      console.error(`❌ Invalid format: ${envVar} (must start with 'app_')`);
    } else {
      console.log(`✅ ${envVar}: ${value.substring(0, 15)}...`);
    }
  }
}

console.log('\n═══════════════════════════════════════');

if (allValid) {
  console.log('✅ All required environment variables are set!');
  console.log('\n🚀 Ready to start real-time service!');
  console.log('═══════════════════════════════════════\n');
  
  console.log('Agent User Details:');
  console.log(`  Username: wee5s-agent`);
  console.log(`  User ID: ${process.env.WHOP_AGENT_USER_ID}`);
  console.log(`  App ID: ${process.env.NEXT_PUBLIC_WHOP_APP_ID}`);
  console.log('\nNext steps:');
  console.log('  1. Start Next.js: npm run dev');
  console.log('  2. Initialize service: curl http://localhost:3000/api/init');
  console.log('  3. Check status: curl http://localhost:3000/api/debug/realtime\n');
  
  process.exit(0);
} else {
  console.error('❌ Environment validation failed!');
  
  if (missing.length > 0) {
    console.error(`\n📝 Missing ${missing.length} required variable(s):`);
    missing.forEach(v => console.error(`   - ${v}`));
  }
  
  if (invalid.length > 0) {
    console.error(`\n⚠️  ${invalid.length} variable(s) have invalid format:`);
    invalid.forEach(v => console.error(`   - ${v}`));
  }
  
  console.error('\n💡 Fix these issues before starting the app.');
  console.error('═══════════════════════════════════════\n');
  process.exit(1);
}
