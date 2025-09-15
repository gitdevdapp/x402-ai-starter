# Environment Setup

Detailed environment configuration for x402 deployment.

## Required Variables

### CDP Credentials
```bash
CDP_API_KEY_ID=your-api-key-id          # From CDP Portal
CDP_API_KEY_SECRET=your-api-key-secret  # From CDP Portal
CDP_WALLET_SECRET=your-wallet-secret    # From CDP Portal
```

### Network Configuration
```bash
NETWORK=base-sepolia  # Testnet (development)
NETWORK=base         # Mainnet (production)
```

### Optional Variables
```bash
VERCEL_AI_GATEWAY_KEY=your-vercel-key  # For AI features
URL=http://localhost:3000              # Custom URL
```

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

## Validation

The application validates environment on startup:
```typescript
// Automatic validation via src/lib/env.ts
{
  CDP_WALLET_SECRET: required string,
  CDP_API_KEY_ID: required string, 
  CDP_API_KEY_SECRET: required string,
  NETWORK: enum ["base-sepolia", "base"] default "base-sepolia",
  VERCEL_AI_GATEWAY_KEY: required string
}
```

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

### Vercel
```bash
# Via CLI
vercel env add CDP_API_KEY_ID
vercel env add CDP_API_KEY_SECRET
vercel env add CDP_WALLET_SECRET
vercel env add NETWORK

# Via Dashboard
Project Settings → Environment Variables
```

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

4. **AI Gateway Issues**
   ```
   Error: VERCEL_AI_GATEWAY_KEY required
   ```
   - Set the AI gateway key for AI features
   - Or disable AI features if not needed

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
