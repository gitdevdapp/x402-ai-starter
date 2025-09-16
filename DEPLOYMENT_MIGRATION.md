# Deployment Migration Guide

## Middleware Size Fix - Migration Instructions

The middleware has been successfully optimized to reduce size from 1.18 MB to 33.6 kB (97% reduction), solving the Vercel Edge Function size limit issue.

## Pre-Deployment Steps

### 1. Generate Seller Account Address

Before deploying, you need to generate a seller account address and add it to your environment variables:

```bash
# Run the seller account generation script
pnpm run generate-seller
```

This will output something like:
```
✅ Seller account generated successfully!
📍 Address: 0x1234567890abcdef1234567890abcdef12345678

🔧 Add this to your environment variables:
SELLER_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### 2. Add Environment Variable

#### For Local Development (.env.local)
```bash
echo "SELLER_ADDRESS=0x1234567890abcdef1234567890abcdef12345678" >> .env.local
```

#### For Vercel Deployment
Add the environment variable in your Vercel dashboard or via CLI:

```bash
# Via Vercel CLI
vercel env add SELLER_ADDRESS

# Or add to Vercel dashboard:
# Project Settings > Environment Variables > Add New
# Name: SELLER_ADDRESS
# Value: 0x1234567890abcdef1234567890abcdef12345678
```

## What Changed

### Architecture Improvements
- **Lightweight Middleware**: Reduced from 1.18 MB to 33.6 kB
- **API Delegation**: Heavy operations moved to Node.js runtime
- **Pre-computed Seller**: Account generation moved to deployment step
- **Edge Runtime Compatible**: No more Node.js API warnings

### Files Modified
- `src/middleware.ts` - Lightweight delegation logic
- `src/lib/env.ts` - Added SELLER_ADDRESS environment variable
- `src/lib/middleware-utils.ts` - Extracted utility functions
- `src/app/api/payment-validate/route.ts` - Payment validation endpoint
- `scripts/generate-seller.js` - Seller account generation script
- `package.json` - Added generate-seller script

### Files Created
- `docs/future/middleware-fix-plan.md` - Comprehensive planning document
- `src/lib/middleware-utils.ts` - Lightweight utility functions
- `src/app/api/payment-validate/route.ts` - Payment validation API
- `scripts/generate-seller.js` - Account generation script

## Deployment Process

### Step 1: Local Testing
```bash
# 1. Generate seller account
pnpm run generate-seller

# 2. Add to local environment
echo "SELLER_ADDRESS=<generated-address>" >> .env.local

# 3. Test build
pnpm run build

# 4. Test locally
pnpm run dev
```

### Step 2: Production Deployment
```bash
# 1. Add environment variable to Vercel
vercel env add SELLER_ADDRESS

# 2. Deploy
vercel --prod
```

## Verification

### Build Size Check
After deployment, verify the middleware size in the build output:
```
ƒ Middleware                             33.6 kB
```

Should be well under the 1 MB limit.

### Functionality Check
1. Visit `/blog` - should work normally for regular users
2. Visit `/blog?bot=true` - should trigger payment flow
3. Visit `/api/add` - should trigger payment flow
4. Check `/api/payment-validate` endpoint exists

## Troubleshooting

### Missing SELLER_ADDRESS
If you see errors about missing SELLER_ADDRESS:
1. Run `pnpm run generate-seller` 
2. Add the output to your environment variables
3. Restart your development server

### Payment Flow Issues
If payment flows aren't working:
1. Check that the payment-validate API route is accessible
2. Verify environment variables are set correctly
3. Check browser network tab for API call failures

### Build Failures
If builds are still failing with size issues:
1. Verify you're using the new middleware version
2. Check that heavy dependencies aren't being imported in middleware
3. Run `pnpm run build` locally to debug

## Rollback Plan

If issues arise, you can temporarily rollback by:
1. Reverting `src/middleware.ts` to the previous version
2. Removing the new API route and utility files
3. Using the environment variable approach when ready to retry

## Benefits

✅ **Size Reduction**: 97% smaller middleware (1.18 MB → 33.6 kB)  
✅ **Edge Runtime Compatible**: No more Node.js API warnings  
✅ **Better Architecture**: Separation of concerns  
✅ **Faster Cold Starts**: Lightweight middleware loads faster  
✅ **Non-breaking**: Same functionality for end users  
✅ **Scalable**: Better foundation for future features
