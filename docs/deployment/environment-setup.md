# Environment Setup

Detailed environment configuration for x402 deployment.

## Environment Variables Overview

⚠️ **CRITICAL**: All variables marked as "Required" MUST be set before deployment or the build will fail.

## 🚀 Quick Setup Template

Create a `.env.local` file in your project root:

```bash
# ==============================================================================
# REQUIRED: Coinbase Developer Platform (CDP) Credentials
# ==============================================================================
CDP_API_KEY_ID=your-api-key-id-here
CDP_API_KEY_SECRET=your-api-key-secret-here  
CDP_WALLET_SECRET=your-wallet-secret-here

# ==============================================================================
# REQUIRED: Vercel AI Gateway (#1 CAUSE OF BUILD FAILURES!)
# ==============================================================================
# Get from: https://vercel.com/dashboard → Storage → AI Gateway
# MUST be set in Vercel environment variables, not just locally!
VERCEL_AI_GATEWAY_KEY=your-vercel-ai-gateway-key-here

# ==============================================================================
# OPTIONAL: Configuration (has defaults)
# ==============================================================================
NETWORK=base-sepolia
# URL=http://localhost:3000  # Auto-generated in production
```

### Required Variables (Build will fail without these)

```bash
# CDP Blockchain Credentials (ALL REQUIRED)
CDP_API_KEY_ID=your-api-key-id          # From CDP Portal - REQUIRED
CDP_API_KEY_SECRET=your-api-key-secret  # From CDP Portal - REQUIRED
CDP_WALLET_SECRET=your-wallet-secret    # From CDP Portal - REQUIRED

# AI Gateway (REQUIRED for AI features)
VERCEL_AI_GATEWAY_KEY=your-vercel-key   # Vercel AI Gateway Key - REQUIRED
```

### Optional Variables (Have defaults or auto-generated)

```bash
# Network Configuration
NETWORK=base-sepolia  # Defaults to "base-sepolia" if not set
# NETWORK=base        # Use for mainnet/production

# URL Configuration  
URL=https://your-domain.com  # Auto-generated from Vercel if not set
```

## ⚠️ Pre-Deployment Validation

**Before deploying, verify ALL required variables are set:**

```bash
# Check your environment variables
echo "CDP_API_KEY_ID: ${CDP_API_KEY_ID:+SET}"
echo "CDP_API_KEY_SECRET: ${CDP_API_KEY_SECRET:+SET}" 
echo "CDP_WALLET_SECRET: ${CDP_WALLET_SECRET:+SET}"
echo "VERCEL_AI_GATEWAY_KEY: ${VERCEL_AI_GATEWAY_KEY:+SET}"
```

All should show "SET" - if any show blank, the deployment will fail.

## Getting CDP Credentials

### Step 1: CDP Account
1. Visit [CDP Portal](https://portal.cdp.coinbase.com)
2. Create account or sign in
3. Complete verification if required

### Step 2: API Key
1. Navigate to API Keys section
2. Click "Create API Key"
3. Name: "x402-production" (or environment name)
4. Copy API Key ID and Secret
5. Store securely (secret shown only once)

### Step 3: Wallet Secret
1. Go to Server Wallets section
2. Click "Generate Wallet Secret"
3. Copy the wallet secret
4. Store securely (shown only once)

## Environment Files

### Development (.env.local)
```bash
# Development environment
CDP_API_KEY_ID=cdp_api_key_dev_123
CDP_API_KEY_SECRET=dev-secret-key
CDP_WALLET_SECRET=dev-wallet-secret
NETWORK=base-sepolia
VERCEL_AI_GATEWAY_KEY=dev-ai-key
```

### Production
Set via deployment platform environment variables:
- Vercel: Project Settings → Environment Variables
- AWS: Systems Manager Parameter Store
- Docker: Environment variables or secrets

## Build-Time Validation

⚠️ **CRITICAL**: The application validates ALL environment variables during the build process, NOT at runtime.

### Validation Schema (src/lib/env.ts)
```typescript
// Build will FAIL if any of these are missing or invalid:
{
  CDP_WALLET_SECRET: required string,      // ❌ Build fails if missing
  CDP_API_KEY_ID: required string,         // ❌ Build fails if missing 
  CDP_API_KEY_SECRET: required string,     // ❌ Build fails if missing
  VERCEL_AI_GATEWAY_KEY: required string,  // ❌ Build fails if missing
  NETWORK: enum ["base-sepolia", "base"] default "base-sepolia",  // ✅ Has default
  URL: string url() default "http://localhost:3000"              // ✅ Has default
}
```

### Validation Timing
- **Local Development**: Validates when starting dev server (`npm run dev`)
- **Build Process**: Validates during `npm run build` (this is where Vercel fails)
- **NOT Runtime**: Missing variables cause build failure, not runtime errors

### Common Validation Errors

```bash
❌ Invalid environment variables: [
  {
    code: 'invalid_type',
    expected: 'string', 
    received: 'undefined',
    path: [ 'VERCEL_AI_GATEWAY_KEY' ],
    message: 'Required'
  }
]
```

This error means the build process cannot find the required environment variable.

## Security Best Practices

### Development
- Use separate development credentials
- Never commit environment files
- Rotate credentials regularly
- Use testnet only

### Production
- Use dedicated production credentials
- Store in secure credential management
- Enable monitoring and alerts
- Implement access controls

## Platform-Specific Setup

### Vercel (RECOMMENDED)

**⚠️ IMPORTANT**: Set ALL required variables before deploying to avoid build failures.

```bash
# Via CLI (Recommended - ensures all required vars are set)
vercel env add CDP_API_KEY_ID
vercel env add CDP_API_KEY_SECRET  
vercel env add CDP_WALLET_SECRET
vercel env add VERCEL_AI_GATEWAY_KEY  # ← CRITICAL: Often forgotten!
vercel env add NETWORK                # Optional, defaults to base-sepolia

# Via Dashboard
# 1. Go to your project dashboard
# 2. Project Settings → Environment Variables
# 3. Add each required variable with appropriate values
# 4. Set environment scope (Production, Preview, Development)
```

**Deployment Checklist for Vercel:**
- [ ] `CDP_API_KEY_ID` set
- [ ] `CDP_API_KEY_SECRET` set  
- [ ] `CDP_WALLET_SECRET` set
- [ ] `VERCEL_AI_GATEWAY_KEY` set ← **Most commonly missed!**
- [ ] Test build locally: `npm run build`
- [ ] Deploy: `vercel --prod`

### Docker
```dockerfile
# Use secrets for production
ENV CDP_API_KEY_ID=""
ENV CDP_API_KEY_SECRET=""
ENV CDP_WALLET_SECRET=""
ENV NETWORK="base-sepolia"
```

### AWS Lambda
```yaml
# serverless.yml
environment:
  CDP_API_KEY_ID: ${ssm:/x402/cdp-api-key-id}
  CDP_API_KEY_SECRET: ${ssm:/x402/cdp-api-key-secret}
  CDP_WALLET_SECRET: ${ssm:/x402/wallet-secret}
  NETWORK: ${opt:stage, 'base-sepolia'}
```

## Testing Configuration

### Verify Setup
```bash
# Check environment loading
npm run dev

# Should see successful CDP connection
# Should create test accounts
# Should connect to specified network
```

### Test Credentials
```bash
# Simple test script
node -e "
const { CdpClient } = require('@coinbase/cdp-sdk');
const cdp = new CdpClient();
cdp.evm.createAccount().then(acc => 
  console.log('✅ Credentials work:', acc.address)
).catch(err => 
  console.error('❌ Credentials invalid:', err.message)
);
"
```

## Troubleshooting

### Common Environment Issues

1. **Missing Variables**
   ```
   Error: Missing required environment variables
   ```
   - Check all required variables are set
   - Verify variable names (case-sensitive)
   - Restart application after changes

2. **Invalid Credentials**
   ```
   Error: Unauthorized / Invalid API key
   ```
   - Verify credentials in CDP Portal
   - Check API key hasn't been revoked
   - Ensure wallet secret is correct

3. **Network Issues**
   ```
   Error: Invalid network configuration
   ```
   - Set NETWORK to "base-sepolia" or "base"
   - Check for typos in network name

4. **AI Gateway Issues** (#1 CAUSE OF BUILD FAILURES)
   ```
   ❌ Invalid environment variables: [
     {
       code: 'invalid_type',
       expected: 'string',
       received: 'undefined', 
       path: [ 'VERCEL_AI_GATEWAY_KEY' ],
       message: 'Required'
     }
   ]
   ```
   **This is the exact error you're getting!**
   
   **Solutions:**
   1. Get key from [Vercel Dashboard](https://vercel.com/dashboard) → Storage → AI Gateway
   2. Set in Vercel: `vercel env add VERCEL_AI_GATEWAY_KEY`
   3. Verify: `vercel env ls | grep VERCEL_AI_GATEWAY_KEY`
   4. Redeploy: `vercel --prod`
   
   **Why this fails:** Environment variable exists locally but not in Vercel's deployment environment. This is REQUIRED for AI features (OpenAI GPT-4o, Google Gemini) - cannot be disabled or made optional.

### Debug Environment
```bash
# Show loaded environment (safe values only)
node -e "
const { env } = require('./src/lib/env.js');
console.log('Network:', env.NETWORK);
console.log('Has API Key:', !!env.CDP_API_KEY_ID);
console.log('Has Secret:', !!env.CDP_API_KEY_SECRET);
console.log('Has Wallet:', !!env.CDP_WALLET_SECRET);
"
```
