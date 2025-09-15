#!/usr/bin/env node

/**
 * Pre-deployment environment validation script
 * 
 * This script validates that all required environment variables are set
 * before attempting deployment to prevent build failures.
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate-env (if added to package.json)
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`)
};

/**
 * Required environment variables that must be set for deployment
 */
const requiredVars = [
  'CDP_WALLET_SECRET',
  'CDP_API_KEY_ID', 
  'CDP_API_KEY_SECRET',
  'VERCEL_AI_GATEWAY_KEY'
];

/**
 * Optional variables with defaults
 */
const optionalVars = [
  { name: 'NETWORK', default: 'base-sepolia' },
  { name: 'URL', default: 'auto-generated' }
];

function validateEnvironment() {
  log.header('Environment Variable Validation');
  
  let hasErrors = false;
  let warnings = [];

  // Check required variables
  log.info('Checking required environment variables...\n');
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      log.error(`${varName} is missing or empty`);
      hasErrors = true;
    } else {
      // Show partial value for security (first 4 chars + ...)
      const maskedValue = value.length > 8 
        ? `${value.substring(0, 4)}...` 
        : '***';
      log.success(`${varName}: ${maskedValue}`);
    }
  }

  // Check optional variables
  log.info('\nChecking optional environment variables...\n');
  
  for (const { name, default: defaultValue } of optionalVars) {
    const value = process.env[name];
    
    if (!value || value.trim() === '') {
      log.warning(`${name}: using default (${defaultValue})`);
      warnings.push(`${name} will use default value: ${defaultValue}`);
    } else {
      log.success(`${name}: ${value}`);
    }
  }

  // Try to validate with the actual schema
  log.info('\nValidating with application schema...\n');
  
  try {
    const env = createEnv({
      server: {
        CDP_WALLET_SECRET: z.string(),
        CDP_API_KEY_ID: z.string(),
        CDP_API_KEY_SECRET: z.string(),
        NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
        URL: z.string().url().default("http://localhost:3000"),
        VERCEL_AI_GATEWAY_KEY: z.string(),
      },
      runtimeEnv: {
        CDP_WALLET_SECRET: process.env.CDP_WALLET_SECRET,
        CDP_API_KEY_ID: process.env.CDP_API_KEY_ID,
        CDP_API_KEY_SECRET: process.env.CDP_API_KEY_SECRET,
        NETWORK: process.env.NETWORK,
        URL: process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : undefined,
        VERCEL_AI_GATEWAY_KEY: process.env.VERCEL_AI_GATEWAY_KEY,
      },
      emptyStringAsUndefined: true,
    });
    
    log.success('Environment validation passed!');
    
  } catch (error) {
    log.error('Environment validation failed with application schema:');
    console.error(error.message);
    hasErrors = true;
  }

  // Summary
  log.header('Validation Summary');
  
  if (hasErrors) {
    log.error('Environment validation FAILED');
    log.error('Deployment will fail if you proceed');
    log.info('\nTo fix:');
    log.info('1. Set missing environment variables');
    log.info('2. For Vercel: vercel env add <VARIABLE_NAME>');
    log.info('3. Or use Vercel dashboard: Project Settings → Environment Variables');
    log.info('4. Re-run this script to verify: node scripts/validate-env.js');
    process.exit(1);
  } else {
    log.success('All required environment variables are set!');
    
    if (warnings.length > 0) {
      log.warning(`${warnings.length} warning(s):`);
      warnings.forEach(warning => log.warning(warning));
    }
    
    log.success('Environment is ready for deployment ✨');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
}

export { validateEnvironment };
