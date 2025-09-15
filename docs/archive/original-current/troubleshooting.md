# Troubleshooting Guide

## Common Issues and Solutions

This guide covers common problems you might encounter when working with Sepolia testnet funds and wallet functionality in your x402 project.

## Environment and Setup Issues

### 1. Missing Environment Variables

**Error:**
```
Error: Missing required environment variables: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
```

**Solutions:**
1. Check that `.env.local` exists in project root
2. Verify all required variables are set:
   ```bash
   CDP_API_KEY_ID=your-key-id
   CDP_API_KEY_SECRET=your-key-secret  
   CDP_WALLET_SECRET=your-wallet-secret
   ```
3. Restart development server after adding variables
4. Check for typos in variable names (case-sensitive)

### 2. Invalid CDP Credentials

**Error:**
```
Error: Unauthorized request / Invalid API key
```

**Solutions:**
1. **Verify credentials in CDP Portal**:
   - Visit [CDP Portal](https://portal.cdp.coinbase.com)
   - Check API key status (not revoked)
   - Regenerate keys if necessary

2. **Check key format**:
   ```bash
   # API Key ID should look like: cdp_api_key_...
   # Wallet Secret should be a long string
   ```

3. **Test credentials**:
   ```typescript
   // Simple test script
   import { CdpClient } from "@coinbase/cdp-sdk";
   const cdp = new CdpClient();
   const account = await cdp.evm.createAccount();
   console.log("✅ Credentials work:", account.address);
   ```

### 3. Network Configuration Problems

**Error:**
```
Error: Invalid network: undefined
Error: Network not supported
```

**Solutions:**
1. **Set NETWORK variable**:
   ```bash
   NETWORK=base-sepolia  # For testnet
   NETWORK=base         # For mainnet
   ```

2. **Check environment loading**:
   ```typescript
   import { env } from "@/lib/env";
   console.log("Current network:", env.NETWORK);
   ```

## Wallet and Account Issues

### 4. Account Creation Failures

**Error:**
```
Error: Failed to create account
Error: Account name already exists
```

**Solutions:**
1. **Use unique account names**:
   ```typescript
   // Add timestamp for uniqueness
   const name = `TestAccount_${Date.now()}`;
   const account = await cdp.evm.getOrCreateAccount({ name });
   ```

2. **Handle existing accounts**:
   ```typescript
   try {
     const account = await cdp.evm.getOrCreateAccount({ name: "MyAccount" });
   } catch (error) {
     if (error.message.includes("already exists")) {
       // Account exists, continue
       const account = await cdp.evm.getAccount("MyAccount");
     }
   }
   ```

### 5. Insufficient Funds Errors

**Error:**
```
Error: Insufficient funds for transaction
Error: Cannot pay for gas
```

**Solutions:**
1. **Check current balances**:
   ```typescript
   const balances = await account.listTokenBalances({ network: "base-sepolia" });
   console.log("Balances:", balances.balances);
   ```

2. **Manual faucet request**:
   ```typescript
   // Request USDC
   await cdp.evm.requestFaucet({
     address: account.address,
     network: "base-sepolia",
     token: "usdc"
   });
   
   // Request ETH for gas
   await cdp.evm.requestFaucet({
     address: account.address,
     network: "base-sepolia", 
     token: "eth"
   });
   ```

3. **Wait for funding to confirm**:
   ```typescript
   const receipt = await publicClient.waitForTransactionReceipt({
     hash: faucetTransactionHash,
   });
   console.log("Funding confirmed:", receipt.status);
   ```

## Faucet and Funding Issues

### 6. Faucet Rate Limiting

**Error:**
```
Error: Rate limit exceeded
Error: Too many requests
```

**Solutions:**
1. **Wait for cooldown period** (usually 24 hours)
2. **Use CDP Dashboard faucet** instead of programmatic requests
3. **Check faucet status**:
   ```bash
   # Visit CDP Dashboard to see rate limit status
   https://portal.cdp.coinbase.com/products/faucet
   ```

### 7. Faucet Request Failures

**Error:**
```
Error: Faucet request failed
Error: Address not eligible
```

**Solutions:**
1. **Verify address format**:
   ```typescript
   // Ensure address is valid Ethereum address
   import { isAddress } from "viem";
   console.log("Valid address:", isAddress(account.address));
   ```

2. **Check network consistency**:
   ```typescript
   // Ensure same network for account and faucet
   const faucetNetwork = "base-sepolia";
   const accountNetwork = env.NETWORK;
   console.log("Networks match:", faucetNetwork === accountNetwork);
   ```

3. **Use alternative funding methods**:
   - CDP Dashboard manual faucet
   - Community faucets (use carefully)
   - Transfer from another funded account

### 8. Auto-funding Not Working

**Error:**
```
Purchaser account not getting auto-funded
Balance stays at 0 despite auto-funding logic
```

**Solutions:**
1. **Check network setting**:
   ```bash
   # Auto-funding only works on testnet
   NETWORK=base-sepolia
   ```

2. **Verify balance threshold**:
   ```typescript
   // Auto-funding triggers when USDC < 500,000 (0.50 USDC)
   const threshold = 500000;
   console.log("Current balance:", usdcBalance?.amount);
   console.log("Threshold:", threshold);
   ```

3. **Debug auto-funding logic**:
   ```typescript
   // Add logging to getOrCreatePurchaserAccount
   console.log("Network:", env.NETWORK);
   console.log("USDC Balance:", usdcBalance?.amount || 0);
   console.log("Will auto-fund:", (!usdcBalance || Number(usdcBalance.amount) < 500000));
   ```

## Transaction Issues

### 9. Transaction Failures

**Error:**
```
Error: Transaction reverted
Error: Transaction failed
```

**Solutions:**
1. **Check gas limits**:
   ```typescript
   // Estimate gas before sending
   const gasEstimate = await publicClient.estimateGas({
     account: account.address,
     to: recipient,
     value: amount,
   });
   console.log("Gas estimate:", gasEstimate);
   ```

2. **Verify recipient address**:
   ```typescript
   import { isAddress } from "viem";
   if (!isAddress(recipient)) {
     throw new Error("Invalid recipient address");
   }
   ```

3. **Check contract interactions**:
   ```typescript
   // For ERC-20 transfers, verify contract exists
   const code = await publicClient.getCode({
     address: tokenAddress,
   });
   console.log("Contract exists:", code !== "0x");
   ```

### 10. Slow Transaction Confirmation

**Error:**
```
Transaction pending for long time
waitForTransactionReceipt timeout
```

**Solutions:**
1. **Check network status**:
   - Visit [Base Sepolia Status](https://status.base.org/)
   - Check for network congestion

2. **Increase timeout**:
   ```typescript
   const receipt = await publicClient.waitForTransactionReceipt({
     hash: transactionHash,
     timeout: 120_000, // 2 minutes instead of default
   });
   ```

3. **Monitor transaction manually**:
   ```typescript
   console.log(`Track transaction: https://sepolia.basescan.org/tx/${hash}`);
   ```

## Development and Testing Issues

### 11. Local Development Problems

**Error:**
```
Error: Cannot connect to localhost
Error: Development server not starting
```

**Solutions:**
1. **Check port availability**:
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   pnpm dev
   ```

2. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   pnpm dev
   ```

3. **Check dependencies**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### 12. TypeScript Errors

**Error:**
```
Type errors in wallet code
Property 'address' does not exist
```

**Solutions:**
1. **Update type definitions**:
   ```bash
   pnpm add @types/node@latest
   ```

2. **Check viem version compatibility**:
   ```bash
   # Ensure compatible versions
   pnpm add viem@latest @coinbase/cdp-sdk@latest
   ```

3. **Add type assertions**:
   ```typescript
   const account = await getOrCreatePurchaserAccount();
   const address = account.address as `0x${string}`;
   ```

## Production Issues

### 13. Mainnet Configuration

**Error:**
```
Auto-funding not working on mainnet
Real funds not received
```

**Solutions:**
1. **Understand mainnet differences**:
   - No auto-funding on mainnet
   - Must manually fund accounts
   - Use real USDC/ETH

2. **Manual mainnet funding**:
   ```typescript
   // Production funding check (no auto-faucet)
   if (env.NETWORK === "base") {
     console.warn("Production: Manual funding required");
     console.log("Send USDC to:", account.address);
   }
   ```

3. **Monitor production balances**:
   ```typescript
   // Implement balance alerts for production
   if (Number(usdcBalance.amount) < 5000000) { // $5
     console.error("Production account running low!");
     // Send alert to monitoring system
   }
   ```

## Debugging Tools and Commands

### Useful Debugging Scripts

1. **Test Environment Setup**:
   ```typescript
   // test-setup.js
   import { CdpClient } from "@coinbase/cdp-sdk";
   import { env } from "./src/lib/env.js";
   
   console.log("Network:", env.NETWORK);
   console.log("CDP client initializing...");
   
   const cdp = new CdpClient();
   const account = await cdp.evm.createAccount();
   console.log("✅ Setup working, account:", account.address);
   ```

2. **Check Balances**:
   ```typescript
   // check-balances.js
   import { getOrCreatePurchaserAccount } from "./src/lib/accounts.js";
   
   const account = await getOrCreatePurchaserAccount();
   const balances = await account.listTokenBalances({ network: "base-sepolia" });
   
   console.log("Account:", account.address);
   console.log("Balances:");
   balances.balances.forEach(b => {
     console.log(`  ${b.token.symbol}: ${b.amount}`);
   });
   ```

3. **Test Transactions**:
   ```bash
   # Run test transaction
   npx tsx scripts/test-transaction.ts
   ```

### Monitoring Commands

```bash
# Check if CDP services are up
curl -s https://api.cdp.coinbase.com/platform/health

# Monitor Base Sepolia network
curl -s https://sepolia.base.org/

# Check account on explorer
open "https://sepolia.basescan.org/address/YOUR_ADDRESS"
```

## Getting Help

### 1. Check Documentation
- [CDP Docs](https://docs.cdp.coinbase.com/)
- [Viem Docs](https://viem.sh/)
- [Base Docs](https://docs.base.org/)

### 2. Community Resources
- [CDP Discord](https://discord.gg/coinbasedev)
- [Base Discord](https://discord.gg/buildonbase)
- [GitHub Issues](https://github.com/coinbase/cdp-sdk/issues)

### 3. Enable Debug Logging
```typescript
// Add to your code for detailed logs
process.env.DEBUG = "cdp:*";
```

### 4. Create Minimal Reproduction
When reporting issues, create a minimal example:

```typescript
// minimal-repro.js
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();
// ... minimal code that reproduces the issue
```

Remember: Most issues are related to environment setup, network configuration, or rate limiting. Start with the basics and work your way through the troubleshooting steps systematically.
