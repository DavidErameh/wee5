#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script
 * Validates all required environment variables for WEE5 real-time features
 * 
 * Usage: tsx scripts/check-env.ts
 */

const REQUIRED_ENV_VARS = [
  // Whop Integration
  'WHOP_API_KEY',
  'WHOP_APP_ID',
  'WHOP_AGENT_USER_ID',
  'NEXT_PUBLIC_WHOP_APP_ID',
  
  // Database
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  
  // Redis
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

const OPTIONAL_ENV_VARS = [
  'WHOP_WEBHOOK_SECRET',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'ENABLE_REACTION_POLLING',
] as const;

interface ValidationResult {
  valid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missing: [],
    invalid: [],
    warnings: [],
  };

  console.log('🔍 Validating environment variables...\n');

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value) {
      result.valid = false;
      result.missing.push(envVar);
      console.error(`❌ Missing: ${envVar}`);
    } else {
      // Validate format for specific variables
      if (envVar === 'WHOP_AGENT_USER_ID' && !value.startsWith('user_')) {
        result.valid = false;
        result.invalid.push(`${envVar} (must start with 'user_')`);
        console.error(`❌ Invalid format: ${envVar} (must start with 'user_')`);
      } else if (envVar === 'WHOP_APP_ID' && !value.startsWith('app_')) {
        result.valid = false;
        result.invalid.push(`${envVar} (must start with 'app_')`);
        console.error(`❌ Invalid format: ${envVar} (must start with 'app_')`);
      } else if (envVar === 'NEXT_PUBLIC_WHOP_APP_ID' && !value.startsWith('app_')) {
        result.valid = false;
        result.invalid.push(`${envVar} (must start with 'app_')`);
        console.error(`❌ Invalid format: ${envVar} (must start with 'app_')`);
      } else {
        console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
      }
    }
  }

  console.log('\n📋 Optional variables:');
  
  // Check optional variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value) {
      result.warnings.push(envVar);
      console.warn(`⚠️  Not set: ${envVar} (optional)`);
    } else {
      console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
    }
  }

  return result;
}

function main() {
  console.log('═══════════════════════════════════════');
  console.log('  WEE5 Environment Validation');
  console.log('═══════════════════════════════════════\n');

  const result = validateEnvironment();

  console.log('\n═══════════════════════════════════════');
  
  if (result.valid) {
    console.log('✅ All required environment variables are set!');
    
    if (result.warnings.length > 0) {
      console.log(`\n⚠️  ${result.warnings.length} optional variable(s) not set:`);
      result.warnings.forEach(v => console.log(`   - ${v}`));
    }
    
    console.log('\n🚀 Ready to start real-time service!');
    console.log('═══════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error('❌ Environment validation failed!');
    
    if (result.missing.length > 0) {
      console.error(`\n📝 Missing ${result.missing.length} required variable(s):`);
      result.missing.forEach(v => console.error(`   - ${v}`));
    }
    
    if (result.invalid.length > 0) {
      console.error(`\n⚠️  ${result.invalid.length} variable(s) have invalid format:`);
      result.invalid.forEach(v => console.error(`   - ${v}`));
    }
    
    console.error('\n💡 Fix these issues before starting the app.');
    console.error('   See .env.example for required format.');
    console.error('═══════════════════════════════════════\n');
    process.exit(1);
  }
}

main();