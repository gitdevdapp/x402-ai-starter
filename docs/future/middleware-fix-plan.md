# Middleware Size Reduction Plan

## Current Problem
The Edge Function middleware is 1.18 MB, exceeding Vercel's 1 MB limit for the current plan.

## Root Cause Analysis

### Heavy Dependencies Contributing to Size
1. **@coinbase/cdp-sdk** - Large SDK with crypto operations
2. **viem** - Ethereum library with extensive functionality  
3. **axios** - HTTP client bundled with cdp-sdk
4. **Node.js APIs** incompatible with Edge Runtime

### Current Architecture Issues
- Middleware imports heavy blockchain libraries at startup
- Seller account creation happens synchronously in middleware
- Direct import of CDP SDK brings entire dependency tree
- Edge Runtime incompatibilities causing warnings

## Size Reduction Strategy

### Phase 1: Immediate Fixes (Safe & Non-breaking)

#### 1.1 Move Account Creation Out of Middleware
- **Action**: Remove seller account initialization from middleware
- **Method**: Pre-generate seller account address and store as environment variable
- **Impact**: Eliminates CDP SDK import from middleware
- **Breaking Change**: No - maintains same functionality

#### 1.2 Lazy Load Heavy Dependencies
- **Action**: Create lightweight middleware that delegates to API routes
- **Method**: Move payment validation to dedicated API endpoints
- **Impact**: Reduces middleware to routing logic only
- **Breaking Change**: No - transparent to users

#### 1.3 Optimize Import Strategy
- **Action**: Use selective imports and dynamic imports where possible
- **Method**: Import only needed functions, not entire libraries
- **Impact**: Reduces bundle size by excluding unused code
- **Breaking Change**: No - same functionality

### Phase 2: Architecture Improvements

#### 2.1 API Route Delegation Pattern
```typescript
// Lightweight middleware
export default async function middleware(request: NextRequest) {
  // Simple routing logic only
  if (needsPayment(request)) {
    return NextResponse.redirect('/api/payment-check')
  }
  return NextResponse.next()
}
```

#### 2.2 Environment-Based Seller Address
```bash
# Pre-computed seller address
SELLER_ADDRESS=0x1234...abcd
```

#### 2.3 Payment Validation API
- Create `/api/payment-validate` endpoint
- Handle heavy crypto operations in Node.js runtime
- Return simple pass/fail to middleware

### Phase 3: Implementation Steps

#### 3.1 Pre-deployment Setup
1. Generate seller account address offline
2. Add `SELLER_ADDRESS` to environment variables
3. Create payment validation API route
4. Update middleware to use lightweight pattern

#### 3.2 Code Changes
1. Extract account creation to standalone script
2. Simplify middleware imports
3. Implement API route delegation
4. Add fallback mechanisms

#### 3.3 Testing Strategy
1. Local build size verification
2. Vercel build testing
3. Functionality validation
4. Performance testing

## Implementation Timeline

### Immediate (Day 1)
- [ ] Create seller account generation script
- [ ] Extract seller address to environment
- [ ] Simplify middleware imports
- [ ] Test local build size

### Short-term (Day 2-3)  
- [ ] Implement API route delegation
- [ ] Create payment validation endpoint
- [ ] Update middleware routing logic
- [ ] Deploy and verify size reduction

### Validation (Day 4)
- [ ] End-to-end functionality testing
- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Production deployment

## Risk Mitigation

### Backwards Compatibility
- Maintain same payment flow for users
- Preserve all existing functionality
- No changes to protected routes
- Same bot detection logic

### Fallback Mechanisms
- Graceful degradation if payment API fails
- Error handling for missing environment variables
- Retry logic for transient failures
- Monitoring and alerting

### Performance Considerations
- API delegation adds minimal latency
- Caching strategies for frequent requests
- Connection pooling for database operations
- Efficient error handling

## Success Metrics

### Primary Goals
- [ ] Middleware size < 1 MB (target: ~500 KB)
- [ ] Build passes without Edge Runtime warnings
- [ ] All existing functionality preserved
- [ ] No breaking changes for users

### Secondary Goals
- [ ] Improved cold start performance
- [ ] Better error handling
- [ ] Enhanced monitoring capabilities
- [ ] Cleaner architecture

## Rollback Plan

If issues arise:
1. Revert middleware to previous version
2. Use monolithic approach temporarily
3. Investigate alternative hosting options
4. Consider upgrading Vercel plan as short-term fix

## Dependencies

### Required Environment Variables
```bash
SELLER_ADDRESS=<pre-generated-address>
CDP_WALLET_SECRET=<existing>
CDP_API_KEY_ID=<existing>
CDP_API_KEY_SECRET=<existing>
NETWORK=<existing>
```

### New Files to Create
- `scripts/generate-seller.js` - Account generation
- `src/app/api/payment-validate/route.ts` - Payment validation
- `src/lib/middleware-utils.ts` - Lightweight utilities

### Files to Modify
- `src/middleware.ts` - Simplify and delegate
- `src/lib/accounts.ts` - Remove from middleware path
- Package imports optimization

## Monitoring & Verification

### Build Monitoring
- Bundle analyzer integration
- Size tracking in CI/CD
- Performance regression detection
- Edge Runtime compatibility checks

### Runtime Monitoring  
- Payment flow success rates
- API response times
- Error rates and types
- User experience metrics

This plan provides a safe, non-breaking path to reduce middleware size while maintaining all existing functionality and improving the overall architecture.