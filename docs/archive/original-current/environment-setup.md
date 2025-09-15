# Environment Setup Guide

## Required Environment Variables

This project requires several environment variables to function properly. Create a `.env.local` file in your project root with the following variables:

### CDP (Coinbase Developer Platform) Credentials

```bash
# Required: CDP API Key ID
CDP_API_KEY_ID=your-api-key-id

# Required: CDP API Key Secret  
CDP_API_KEY_SECRET=your-api-key-secret

# Required: CDP Wallet Secret
CDP_WALLET_SECRET=your-wallet-secret
```

### Network Configuration

```bash
# Optional: Network selection (defaults to base-sepolia)
# Options: "base-sepolia" (testnet) or "base" (mainnet)
NETWORK=base-sepolia
```

### AI Gateway (Optional)

```bash
# Optional: Vercel AI Gateway Key (for AI features)
VERCEL_AI_GATEWAY_KEY=your-vercel-ai-gateway-key
```

## Getting CDP Credentials

### Step 1: Create CDP Account

1. Visit [CDP Portal](https://portal.cdp.coinbase.com/create-account)
2. Sign up for a new account or [sign in](https://portal.cdp.coinbase.com/signin) to existing account
3. Complete account verification if required

### Step 2: Generate API Key

1. Navigate to [API Keys](https://portal.cdp.coinbase.com/projects/api-keys)
2. Click "Create API Key"
3. Name your API key (e.g., "x402-development")
4. Copy the **API Key ID** and **API Key Secret**
5. Store these securely - the secret won't be shown again

### Step 3: Generate Wallet Secret

1. Go to [Server Wallets](https://portal.cdp.coinbase.com/products/server-wallets)
2. Click "Generate Wallet Secret" or "Create New Secret"
3. Copy the **Wallet Secret**
4. Store this securely - it won't be shown again

## Environment File Examples

### Development (.env.local)

```bash
# CDP Credentials
CDP_API_KEY_ID=cdp_api_key_123abc
CDP_API_KEY_SECRET=your-secret-key-here
CDP_WALLET_SECRET=your-wallet-secret-here

# Use testnet for development
NETWORK=base-sepolia

# Optional AI features
VERCEL_AI_GATEWAY_KEY=your-vercel-key
```

### Production (.env)

```bash
# CDP Credentials (use production keys)
CDP_API_KEY_ID=cdp_api_key_prod_456def
CDP_API_KEY_SECRET=your-production-secret
CDP_WALLET_SECRET=your-production-wallet-secret

# Use mainnet for production
NETWORK=base

# Production AI Gateway
VERCEL_AI_GATEWAY_KEY=your-production-vercel-key
```

## Environment Validation

The project uses `@t3-oss/env-nextjs` for environment variable validation. The validation schema is defined in `src/lib/env.ts`:

```typescript
export const env = createEnv({
  server: {
    CDP_WALLET_SECRET: z.string(),
    CDP_API_KEY_ID: z.string(), 
    CDP_API_KEY_SECRET: z.string(),
    NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
    URL: z.string().url().default("http://localhost:3000"),
    VERCEL_AI_GATEWAY_KEY: z.string(),
  },
  // ... runtime env mapping
});
```

## Vercel Deployment

### Using Vercel CLI

```bash
# Pull environment variables from Vercel project
vc env pull

# Or add variables manually
vc env add CDP_API_KEY_ID
vc env add CDP_API_KEY_SECRET  
vc env add CDP_WALLET_SECRET
vc env add NETWORK
```

### Using Vercel Dashboard

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each required variable:
   - Name: `CDP_API_KEY_ID`, Value: `your-api-key-id`
   - Name: `CDP_API_KEY_SECRET`, Value: `your-api-key-secret`
   - Name: `CDP_WALLET_SECRET`, Value: `your-wallet-secret`
   - Name: `NETWORK`, Value: `base-sepolia` or `base`

## Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:
```
.env.local
.env
.env.production
```

### 2. Use Different Keys for Different Environments

- **Development**: Separate API keys for local development
- **Staging**: Different keys for staging environment
- **Production**: Dedicated production keys with appropriate permissions

### 3. Rotate Keys Regularly

- Generate new API keys periodically
- Update wallet secrets if compromised
- Monitor key usage in CDP dashboard

### 4. Limit Key Permissions

- Only grant necessary permissions to API keys
- Use read-only keys where possible
- Monitor key usage for unusual activity

## Troubleshooting

### Common Environment Issues

1. **Missing Required Variables**
   ```
   Error: Missing required environment variables
   ```
   - Check all required variables are set in `.env.local`
   - Verify variable names match exactly (case-sensitive)

2. **Invalid CDP Credentials**
   ```
   Error: Unauthorized or Invalid API key
   ```
   - Verify API Key ID and Secret are correct
   - Check that API key hasn't been revoked
   - Ensure Wallet Secret is valid

3. **Network Configuration Issues**
   ```
   Error: Invalid network configuration
   ```
   - Confirm `NETWORK` is set to `base-sepolia` or `base`
   - Check for typos in network name

4. **URL Configuration in Production**
   ```
   Error: Invalid URL format
   ```
   - Ensure `VERCEL_PROJECT_PRODUCTION_URL` is set correctly
   - Check URL format includes protocol (https://)

### Validation Errors

The project will fail to start if required environment variables are missing or invalid:

```bash
# Check if environment is properly configured
npm run dev

# Look for validation errors in console
```

### Testing Environment Setup

Create a simple test script to verify credentials:

```typescript
// test-env.js
import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function testSetup() {
  try {
    const cdp = new CdpClient();
    console.log("✅ CDP client initialized successfully");
    
    const account = await cdp.evm.createAccount();
    console.log(`✅ Account created: ${account.address}`);
    
    console.log("🎉 Environment setup is working correctly!");
  } catch (error) {
    console.error("❌ Environment setup failed:", error.message);
  }
}

testSetup();
```

Run with: `npx tsx test-env.js`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CDP_API_KEY_ID` | ✅ | - | CDP API Key identifier |
| `CDP_API_KEY_SECRET` | ✅ | - | CDP API Key secret |
| `CDP_WALLET_SECRET` | ✅ | - | CDP Wallet secret for account management |
| `NETWORK` | ❌ | `base-sepolia` | Network: `base-sepolia` or `base` |
| `VERCEL_AI_GATEWAY_KEY` | ✅* | - | Vercel AI Gateway key (*required for AI features) |
| `URL` | ❌ | `http://localhost:3000` | Application URL |

## Next Steps

Once your environment is configured:

1. ✅ **Test the setup**: Run `pnpm dev` to verify everything works
2. ✅ **Check wallet creation**: Visit `/playground` to test account creation
3. ✅ **Verify funding**: Check that testnet funds are automatically requested
4. ✅ **Monitor transactions**: Use Base Sepolia explorer to track transactions

Your environment is now ready for Sepolia testnet development!
