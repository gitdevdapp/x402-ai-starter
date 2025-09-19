# Wallet Balance & Archive UI Fix Plan

## Problem Statement

User reported multiple issues with the wallet interface:
1. Archive button not clearly visible on homepage wallet cards
2. USDC funding failed but ETH worked  
3. Sepolia ETH shows on block explorer but not in UI (balances showing as $0.0000)
4. Need clear archive button to move wallets from homepage to archive

## Root Cause Analysis

### Balance Display Issues
1. **ETH Balance Problem**: The current balance fetching only works for accounts managed by CDP. For ETH, it relies on `account.listTokenBalances()` which may not reflect external transactions or recent funding.

2. **USDC Balance Problem**: While there's a fallback to direct contract reading for USDC, the ETH balance has no such fallback to direct blockchain querying.

3. **Balance Refresh**: The refresh mechanism in `WalletCard.tsx` calls the same API that has these limitations.

### Archive UI Issues  
1. **Archive Button Visibility**: The archive button exists in `WalletCard.tsx` (lines 155-168) but uses a small ghost button with gray text that's not prominent.

2. **Archive Button Location**: The button is positioned in a vertical stack on the right side, making it less discoverable.

## Solution Plan

### Phase 1: Fix ETH Balance Fetching

1. **Enhance Balance API** (`/api/wallet/balance/route.ts`):
   - Add direct ETH balance fetching using `publicClient.getBalance()` 
   - Implement fallback mechanism similar to USDC contract reading
   - Use the higher of CDP balance vs direct blockchain balance
   - Add proper error handling and debugging information

2. **Update List API** (`/api/wallet/list/route.ts`):
   - Apply same ETH balance fetching improvements
   - Ensure consistency between individual balance checks and list view

### Phase 2: Enhance Archive UI Visibility

1. **Improve Archive Button Design**:
   - Change from ghost button to outline variant for better visibility
   - Add proper hover states and focus indicators
   - Consider using warning/destructive color scheme for archiving action
   - Make button text more prominent

2. **Add Archive Actions to Multiple Locations**:
   - Add archive option to wallet dropdown menu (if exists)
   - Consider adding batch archive functionality
   - Add confirmation dialog for archive action

3. **Enhance Archive Statistics Display**:
   - Make archive stats more prominent in main wallet manager
   - Add quick access to archive from main view
   - Show archive count as badge or notification

### Phase 3: Testing & Validation

1. **Create Test Wallet with Actual Funds**:
   - Fund wallet with both USDC and ETH via testnet faucet
   - Verify balances show correctly in UI
   - Test archive functionality
   - Verify balance refresh works correctly

2. **Test Edge Cases**:
   - Newly created wallets
   - Wallets funded externally (not through app)
   - Wallets with only ETH or only USDC
   - Network connectivity issues

## Implementation Details

### ETH Balance Enhancement

```typescript
// Add to balance API route
async function getEthBalanceFromBlockchain(address: string): Promise<number> {
  try {
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`
    });
    return Number(balance) / 1000000000000000000; // Convert wei to ETH
  } catch (error) {
    console.warn("Direct ETH balance check failed:", error);
    return 0;
  }
}
```

### Archive Button Enhancement

```typescript
// Enhanced archive button in WalletCard
<Button
  variant="outline"
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    onArchive(wallet.address, wallet.name);
  }}
  className="p-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
  title="Archive Wallet"
>
  <Archive className="h-3 w-3" />
  <span className="ml-1 text-xs">Archive</span>
</Button>
```

## Files to Modify

1. **Balance APIs**:
   - `src/app/api/wallet/balance/route.ts` - Add ETH blockchain reading
   - `src/app/api/wallet/list/route.ts` - Apply same ETH balance fix

2. **UI Components**:
   - `src/components/wallet/WalletCard.tsx` - Enhance archive button visibility
   - `src/components/wallet/WalletManager.tsx` - Improve archive stats display

3. **Testing**:
   - Update existing tests to verify balance accuracy
   - Add new tests for archive functionality

## Success Criteria

- [ ] ETH balances display correctly for wallets with testnet funds
- [ ] USDC balances display correctly for funded wallets  
- [ ] Archive button is clearly visible and accessible on each wallet card
- [ ] Balance refresh function works for both ETH and USDC
- [ ] All tests pass showing non-zero balances for funded wallets
- [ ] Archive functionality works smoothly without UI glitches

## Risk Mitigation

1. **API Rate Limiting**: Implement proper error handling for blockchain queries
2. **Network Issues**: Add retry logic and fallback to CDP balances
3. **UI Consistency**: Ensure archive button placement doesn't break existing layout
4. **Data Loss**: Ensure archive functionality doesn't lose wallet data

## Timeline

- **Phase 1**: 2-3 hours (balance API fixes)
- **Phase 2**: 1-2 hours (UI enhancements) 
- **Phase 3**: 1 hour (testing and validation)
- **Total**: 4-6 hours

## Deployment Strategy

1. Test all changes locally with funded test wallets
2. Verify balance display shows non-zero amounts
3. Test archive functionality end-to-end
4. Only commit to main if interface clearly shows actual balances
5. Monitor for any regressions after deployment
