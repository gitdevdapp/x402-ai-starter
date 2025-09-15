# Deployment Guide

Complete deployment guide for x402 with pre-deployment validation to prevent build failures.

## 🚀 Quick Deploy Checklist

**Before deploying, complete ALL steps below to avoid build failures:**

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

## 🚨 Emergency Deployment Fix

If deployment is failing right now:

```bash
# 1. Quick validation
npm run validate-env

# 2. If VERCEL_AI_GATEWAY_KEY is missing:
vercel env add VERCEL_AI_GATEWAY_KEY

# 3. Redeploy immediately  
vercel --prod
```

The most common cause of deployment failures is missing `VERCEL_AI_GATEWAY_KEY`.