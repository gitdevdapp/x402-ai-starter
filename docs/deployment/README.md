# X402 Deployment Guide

**Status**: 🟢 **PRODUCTION READY** - All critical issues resolved  
**Version**: Consolidated deployment guide  
**Last Updated**: September 16, 2025

## ⚠️ CRITICAL: Pre-Deployment Verification

**BEFORE deploying, run this command to avoid build failures:**

```bash
# Verify ALL required environment variables are set in Vercel
vercel env ls

# You MUST see these 4 variables listed:
# - CDP_API_KEY_ID
# - CDP_API_KEY_SECRET  
# - CDP_WALLET_SECRET
# - VERCEL_AI_GATEWAY_KEY ← Most commonly missing!
```

**If `VERCEL_AI_GATEWAY_KEY` is missing, the build WILL FAIL** with this exact error:
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

## ✅ All Issues Resolved - Ready to Deploy

All critical deployment issues have been fixed:
- ✅ Environment variables documentation complete
- ✅ Middleware initialization issues resolved  
- ✅ Turbopack build errors fixed

```bash
# 1. Verify all environment variables are set
vercel env ls | grep -E "(CDP_API_KEY_ID|CDP_API_KEY_SECRET|CDP_WALLET_SECRET|VERCEL_AI_GATEWAY_KEY)"

# 2. Test build locally first
npm run build

# 3. Deploy with confidence
vercel --prod

# 4. Verify deployment success
curl -I https://your-domain.vercel.app/api/chat
```

## 🚀 Complete Deployment Checklist

**Follow ALL steps below to ensure successful deployment:**

### Step 1: Environment Variables Setup

#### 🔥 CRITICAL: Get Vercel AI Gateway Key FIRST
- [ ] **Get Vercel AI Gateway key** - [Vercel Dashboard](https://vercel.com/dashboard) → **Storage** → **AI Gateway**
  - [ ] `VERCEL_AI_GATEWAY_KEY` ← **#1 CAUSE OF BUILD FAILURES!**
  - [ ] **Required for AI features** (OpenAI GPT-4o, Google Gemini)
  - [ ] **Must be set in Vercel environment variables, not just locally**

#### Get CDP Credentials
- [ ] **Get CDP credentials** from [CDP Portal](https://portal.cdp.coinbase.com)
  - [ ] `CDP_API_KEY_ID` 
  - [ ] `CDP_API_KEY_SECRET`
  - [ ] `CDP_WALLET_SECRET`

### Step 2: Set Environment Variables

#### Option A: Vercel CLI (Recommended)
```bash
# Set VERCEL_AI_GATEWAY_KEY FIRST (most critical)
vercel env add VERCEL_AI_GATEWAY_KEY
# Enter your Vercel AI Gateway key when prompted

# Then set CDP credentials
vercel env add CDP_API_KEY_ID
vercel env add CDP_API_KEY_SECRET
vercel env add CDP_WALLET_SECRET

# Optional (has defaults)
vercel env add NETWORK  # Optional: defaults to base-sepolia

# VERIFY all variables are set
vercel env ls
```

#### Option B: Vercel Dashboard
1. Go to your project dashboard
2. **Project Settings** → **Environment Variables**  
3. **ADD VERCEL_AI_GATEWAY_KEY FIRST** ← Most critical
4. Add remaining required variables:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET` 
   - `CDP_WALLET_SECRET`

#### ✅ Verification Step (CRITICAL)
```bash
# Confirm all 4 required variables are set before proceeding
vercel env ls | grep -E "(CDP_API_KEY_ID|CDP_API_KEY_SECRET|CDP_WALLET_SECRET|VERCEL_AI_GATEWAY_KEY)"
# Should show all 4 variables
```

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

### Critical Runtime Error: MIDDLEWARE_INVOCATION_FAILED

**Error (Vercel Error Code):**
```
500: INTERNAL_SERVER_ERROR
Code: MIDDLEWARE_INVOCATION_FAILED
ID: sfo1::cwx9m-1758034017861-9fd48c29eb5f
```

**Root Cause**: Middleware attempting synchronous initialization of async resources (CDP accounts, external APIs)

**Symptoms**:
- ✅ Build completes successfully  
- ✅ Environment variables are set correctly
- ❌ All requests return 500 errors
- ❌ Middleware fails during initialization

**Immediate Solution**:
1. **Verify the fix is applied** - Check that middleware uses lazy initialization:
   ```bash
   # Check for problematic top-level await in middleware
   grep -n "await.*getOrCreateSellerAccount" src/middleware.ts
   # Should return NO results (if fixed)
   ```

2. **Test locally first**:
   ```bash
   npm run dev
   curl http://localhost:3000        # Should return 200
   curl http://localhost:3000/api/chat # Should return 405 (expected)
   ```

3. **Deploy the fix**:
   ```bash
   git add src/middleware.ts
   git commit -m "fix: resolve middleware async initialization"
   git push origin main
   ```

**Prevention**:
- ❌ **Never use top-level `await`** in middleware files
- ✅ **Initialize async resources** inside middleware functions  
- ✅ **Implement caching** to avoid repeated initialization
- ✅ **Add error recovery** to prevent complete site failure

**Technical Details**: See `docs/future/middleware-fix-plan.md` for comprehensive analysis

### Critical Build Error: Turbopack Middleware Processing

**Error Pattern**:
```
thread 'tokio-runtime-worker' panicked at turbopack/crates/turbopack-ecmascript/src/lib.rs:2429:13:
The high bits of the position 2848292 are not all 0s or 1s. modules_header_width=11, module=289

Caused by:
- An error occurred while generating the chunk item [project]/src/middleware.ts [middleware] (ecmascript)
```

**Root Cause**: Turbopack bug in Next.js 15.5.2 with complex middleware processing

**Immediate Solution**:
1. **Update build script** in `package.json`:
   ```bash
   # Change from:
   "build": "next build --turbopack"
   # To:
   "build": "next build"
   ```

2. **Remove explicit runtime** from `src/middleware.ts`:
   ```typescript
   export const config = {
     matcher: [...],
     // Remove: runtime: "nodejs",
   };
   ```

3. **Test build locally**:
   ```bash
   npm run build
   # Should complete successfully without Turbopack errors
   ```

**Why This Works**:
- Development still uses Turbopack (faster dev server)
- Production uses stable webpack build (avoids middleware bug)
- No functional changes, only build tooling adjustment

**Status**: ✅ **RESOLVED** - Build now completes successfully

### Debug Middleware Issues

**Check for Middleware Problems**:
```bash
# Verify middleware doesn't have top-level async initialization
grep -n "await.*getOrCreateSellerAccount" src/middleware.ts
# Should return NO results if properly fixed

# Test middleware locally
npm run dev
sleep 5  # Let server start
curl -v http://localhost:3000/api/chat  # Test API middleware
curl -v http://localhost:3000/blog      # Test page middleware
```

**Analyze Vercel Function Logs**:
```bash
# View real-time logs during deployment
vercel logs --follow

# Look for middleware-specific errors
vercel logs | grep -i middleware
vercel logs | grep -i "invocation"
```

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

### ⚠️ Required (Build fails without these)
| Variable | Source | Description | Build Failure Impact |
|----------|--------|-------------|---------------------|
| `VERCEL_AI_GATEWAY_KEY` | **[Vercel Dashboard](https://vercel.com/dashboard) → Storage → AI Gateway** | AI gateway access key for OpenAI/Google models | **#1 cause of build failures** |
| `CDP_API_KEY_ID` | [CDP Portal](https://portal.cdp.coinbase.com) | API key identifier | Build fails during wallet initialization |
| `CDP_API_KEY_SECRET` | CDP Portal | API key secret | Build fails during wallet initialization |
| `CDP_WALLET_SECRET` | CDP Portal | Wallet secret key | Build fails during wallet initialization |

### ✅ Optional (Have defaults)
| Variable | Default | Description |
|----------|---------|-------------|
| `NETWORK` | `base-sepolia` | Blockchain network (`base-sepolia` or `base`) |
| `URL` | Auto-generated | Application URL (Vercel auto-generates) |

### 🔑 How to Get Vercel AI Gateway Key
1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** in the sidebar
3. Click **AI Gateway** 
4. Generate or copy your API key
5. **CRITICAL**: Add it to your Vercel project's environment variables

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

## 🎯 Specific Fix for Your Error

**Your exact error:**
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

**Immediate solution:**
```bash
# 1. Get your Vercel AI Gateway key
# Go to: https://vercel.com/dashboard → Storage → AI Gateway

# 2. Set the environment variable in Vercel
vercel env add VERCEL_AI_GATEWAY_KEY
# Paste your key when prompted

# 3. Verify it's set
vercel env ls | grep VERCEL_AI_GATEWAY_KEY
# Should show: VERCEL_AI_GATEWAY_KEY (Production)

# 4. Redeploy
vercel --prod
```

**Why this happens:** The environment variable is set in your local `.env.local` file but not in Vercel's deployment environment. Vercel builds run in a separate environment that only has access to variables explicitly added to the project.