# Safe Deployment Strategy for x402 AI Starter

**Current Status**: 🔴 Deployment failing due to missing `VERCEL_AI_GATEWAY_KEY`  
**Last Working**: [Commit 9f1eb6b](https://github.com/gitdevdapp/x402-ai-starter/commit/9f1eb6b0faf2855687b632da5424824b8d4a8201)  
**Solution Time**: < 5 minutes

## 🚨 Emergency Fix (Deploy Now)

```bash
# 1. Set the missing environment variable
vercel env add VERCEL_AI_GATEWAY_KEY
# Enter your Vercel AI Gateway key when prompted

# 2. Redeploy immediately
vercel --prod

# 3. Verify deployment success
curl -I https://your-domain.vercel.app/api/chat
```

## 🚀 Complete Deployment Checklist

**Follow ALL steps below to ensure successful deployment:**

### Step 1: Environment Variables Setup
- [ ] **Get CDP credentials** from [CDP Portal](https://portal.cdp.coinbase.com)
  - [ ] `CDP_API_KEY_ID` 
  - [ ] `CDP_API_KEY_SECRET`
  - [ ] `CDP_WALLET_SECRET`
- [ ] **Get Vercel AI Gateway key** from Vercel dashboard → Storage → AI Gateway
  - [ ] `VERCEL_AI_GATEWAY_KEY` ← **Most commonly missed!**

### Step 2: Set Environment Variables

#### Option A: Vercel CLI (Recommended)
```bash
vercel env add CDP_API_KEY_ID
vercel env add CDP_API_KEY_SECRET
vercel env add CDP_WALLET_SECRET
vercel env add VERCEL_AI_GATEWAY_KEY
vercel env add NETWORK  # Optional: defaults to base-sepolia
```

#### Option B: Vercel Dashboard
1. Go to your project dashboard
2. **Project Settings** → **Environment Variables**  
3. Add each required variable:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET` 
   - `CDP_WALLET_SECRET`
   - `VERCEL_AI_GATEWAY_KEY`

### Step 3: Pre-Deployment Validation
```bash
# Validate environment before deploying
npm run validate-env

# Run full pre-deployment check
npm run pre-deploy
```

### Step 4: Deploy
```bash
# Deploy to production
vercel --prod

# Or use Vercel dashboard
# Git push to main branch (auto-deploy)
```

## 🔧 Troubleshooting Failed Deployments

### Common Build Failure: Missing Environment Variables

**Error:**
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

**Solution:**
1. Identify the missing variable (e.g., `VERCEL_AI_GATEWAY_KEY`)
2. Set it in Vercel: `vercel env add VERCEL_AI_GATEWAY_KEY`
3. Redeploy: `vercel --prod`

### Debug Environment Issues

```bash
# Check which variables are set locally
npm run validate-env

# Check variables in Vercel
vercel env ls

# Test build locally
npm run build
```

## 📋 Environment Variable Reference

### Required (Build fails without these)
| Variable | Source | Description |
|----------|--------|-------------|
| `CDP_API_KEY_ID` | [CDP Portal](https://portal.cdp.coinbase.com) | API key identifier |
| `CDP_API_KEY_SECRET` | CDP Portal | API key secret |
| `CDP_WALLET_SECRET` | CDP Portal | Wallet secret key |
| `VERCEL_AI_GATEWAY_KEY` | Vercel Dashboard → Storage → AI Gateway | AI gateway access key |

### Optional (Have defaults)
| Variable | Default | Description |
|----------|---------|-------------|
| `NETWORK` | `base-sepolia` | Blockchain network (`base-sepolia` or `base`) |
| `URL` | Auto-generated | Application URL (Vercel auto-generates) |

## 🛠 Development vs Production

### Development (.env.local)
```bash
# Use testnet and development keys
CDP_API_KEY_ID=cdp_api_key_dev_123
CDP_API_KEY_SECRET=dev-secret-key
CDP_WALLET_SECRET=dev-wallet-secret
VERCEL_AI_GATEWAY_KEY=dev-ai-key
NETWORK=base-sepolia
```

### Production (Vercel Environment Variables)
```bash
# Use production keys and mainnet
CDP_API_KEY_ID=cdp_api_key_prod_456
CDP_API_KEY_SECRET=prod-secret-key
CDP_WALLET_SECRET=prod-wallet-secret  
VERCEL_AI_GATEWAY_KEY=prod-ai-key
NETWORK=base
```

## 🔒 Security Best Practices

1. **Separate Credentials**: Use different CDP credentials for development vs production
2. **Secret Management**: Never commit credentials to git
3. **Access Control**: Limit access to production environment variables
4. **Rotation**: Regularly rotate API keys and secrets
5. **Monitoring**: Monitor for unauthorized access attempts

## 📖 Detailed Documentation

- **[Environment Setup](./environment-setup.md)**: Complete environment configuration guide
- **[Troubleshooting](./troubleshooting.md)**: Common issues and solutions
- **[Security](../archive/original-future/security-improvements.md)**: Security best practices

## 🔄 Safe Deployment Process

### Pre-Deployment Validation (Recommended)

```bash
# Always validate before deploying
npm run validate-env
npm run pre-deploy

# Check current environment status
vercel env ls
```

### Production Deployment Strategy

```bash
# 1. Validate locally first
npm run build

# 2. Set any missing environment variables
vercel env add VERCEL_AI_GATEWAY_KEY  # Most commonly missing

# 3. Deploy with confidence
vercel --prod

# 4. Post-deployment validation
curl -f https://your-domain.vercel.app/api/bot
```

## 🛡️ Coinbase CDP Testnet Safety

### Testnet Configuration (Recommended for Initial Deployment)

```bash
# Ensure testnet settings
vercel env add NETWORK base-sepolia

# Verify testnet funding works
# App will auto-request USDC from faucet when balance < $0.50
```

### Wallet Security Features ✅

1. **Server-Side Management**: Wallets never exposed to client
2. **Auto-Funding**: Testnet accounts funded automatically  
3. **Secure Storage**: CDP handles private key encryption
4. **Account Isolation**: Separate Purchaser/Seller accounts
5. **Transaction Monitoring**: Built-in balance checking

### Production Readiness Checklist

- [ ] All environment variables configured in Vercel
- [ ] CDP credentials are production-grade (not development)
- [ ] Network set to appropriate value (`base-sepolia` for testnet, `base` for mainnet)
- [ ] Wallet funding strategy confirmed (auto-faucet for testnet, manual funding for mainnet)
- [ ] API endpoints tested with production configuration

## ⚡ Quick Recovery

If deployment is failing right now:

```bash
# Emergency fix sequence
vercel env add VERCEL_AI_GATEWAY_KEY  # ← Most common issue
vercel --prod                          # ← Immediate redeploy
```

**Root Cause**: Missing `VERCEL_AI_GATEWAY_KEY` - this is the #1 deployment failure cause.