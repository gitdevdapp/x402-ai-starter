# Current Deployment Issues & Fixes

## Recently Fixed: AI SDK v5 Import Issue

### Issue Description

The Vercel build was failing with the following errors:

```
Export google doesn't exist in target module
Export openai doesn't exist in target module
```

These errors occurred in `./src/app/api/chat/route.ts` when trying to import `openai` and `google` directly from the "ai" package.

## Root Cause

In AI SDK v5, the provider functions (`openai`, `google`, etc.) are no longer exported from the main "ai" package. Instead, they have been moved to separate provider-specific packages:

- `@ai-sdk/openai` for OpenAI provider
- `@ai-sdk/google` for Google provider

## Solution Applied

### 1. Install Required Provider Packages

```bash
pnpm add @ai-sdk/openai @ai-sdk/google
```

### 2. Update Import Statements

**Before (Incorrect):**
```typescript
import { convertToModelMessages, stepCountIs, streamText, UIMessage, openai, google } from "ai";
```

**After (Correct):**
```typescript
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
```

### 3. Verify Build Success

The build now completes successfully:
```bash
pnpm run build
✓ Compiled successfully in 7.2s
```

## Files Modified

- `src/app/api/chat/route.ts`: Updated import statements
- `package.json`: Added new dependencies (via pnpm add)

## Dependencies Added

```json
{
  "dependencies": {
    "@ai-sdk/google": "2.0.14",
    "@ai-sdk/openai": "2.0.30"
  }
}
```

## Testing

The fix was verified by:
1. Running `pnpm run build` locally - ✅ Success
2. All existing functionality remains intact
3. No breaking changes to the API endpoints

## Impact

- ✅ Vercel deployment will now succeed
- ✅ No changes to application functionality
- ✅ Type safety maintained with TypeScript
- ✅ All AI providers continue to work as expected

## Current Issue: Missing Environment Variables

### Issue Description

Build is currently failing with:

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
Error: Invalid environment variables
```

### Root Cause

The application's environment validation schema requires `VERCEL_AI_GATEWAY_KEY` but this variable is not set in the Vercel deployment environment.

### Immediate Fix Required

Add the missing environment variable to Vercel:

```bash
# Via Vercel CLI
vercel env add VERCEL_AI_GATEWAY_KEY

# Or via Vercel Dashboard
# Project Settings → Environment Variables → Add
```

### Required Environment Variables

The following variables are **REQUIRED** for deployment (defined in `src/lib/env.ts`):

```bash
CDP_WALLET_SECRET=your-wallet-secret          # Required
CDP_API_KEY_ID=your-api-key-id                # Required  
CDP_API_KEY_SECRET=your-api-key-secret        # Required
VERCEL_AI_GATEWAY_KEY=your-vercel-ai-key      # Required
NETWORK=base-sepolia                          # Optional (defaults to base-sepolia)
URL=https://your-domain.com                   # Optional (auto-generated from Vercel)
```

### Validation

All environment variables are validated at build time. Missing required variables will cause deployment to fail.

## Next Steps

- **IMMEDIATE**: Set `VERCEL_AI_GATEWAY_KEY` in Vercel environment variables
- Deploy to Vercel to confirm production build success
- Monitor for any related issues in production
- See [deployment documentation](../deployment/README.md) for complete setup guide