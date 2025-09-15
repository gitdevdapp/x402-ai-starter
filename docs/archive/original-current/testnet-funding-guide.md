# Sepolia Testnet Funding Guide

## Overview

This guide provides comprehensive instructions for obtaining and managing Sepolia testnet funds in your x402 project. The project includes automatic funding mechanisms, but this guide covers both automatic and manual funding options.

## Automatic Funding (Already Configured)

Your project includes **automatic testnet funding** that runs whenever the "Purchaser" account balance is low.

### How Automatic Funding Works

```typescript
// From src/lib/accounts.ts - getOrCreatePurchaserAccount()
if (
  env.NETWORK === "base-sepolia" &&
  (!usdcBalance || Number(usdcBalance.amount) < 500000) // < $0.50 USDC
) {
  const { transactionHash } = await cdp.evm.requestFaucet({
    address: account.address,
    network: env.NETWORK,
    token: "usdc",
  });
}
```

### When Automatic Funding Triggers

- **Network**: Only on `base-sepolia` (testnet)
- **Threshold**: When USDC balance < $0.50 (500,000 µUSDC)
- **Token**: Requests USDC from the faucet
- **Wait**: Waits for transaction confirmation before proceeding

## Manual Funding Options

### Option 1: CDP Dashboard (Recommended)

The easiest way to manually fund accounts:

1. **Visit CDP Faucet**: [https://portal.cdp.coinbase.com/products/faucet](https://portal.cdp.coinbase.com/products/faucet?token=USDC&network=base-sepolia)

2. **Configure Faucet**:
   - **Network**: Select "Base Sepolia"
   - **Token**: Choose "USDC" or "ETH"
   - **Address**: Enter your account address

3. **Get Account Address**:
   ```bash
   # Run your app and check logs, or visit /playground
   pnpm dev
   ```
   Look for log output like:
   ```
   Created EVM account: 0x3c0D84055994c3062819Ce8730869D0aDeA4c3Bf
   ```

4. **Request Funds**: Click "Request" and wait for confirmation

### Option 2: Programmatic Funding

Add manual funding to your code:

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

// Fund with USDC
const usdcResponse = await cdp.evm.requestFaucet({
  address: "0xYourAccountAddress",
  network: "base-sepolia",
  token: "usdc"
});

console.log(`USDC faucet tx: https://sepolia.basescan.org/tx/${usdcResponse.transactionHash}`);

// Fund with ETH  
const ethResponse = await cdp.evm.requestFaucet({
  address: "0xYourAccountAddress", 
  network: "base-sepolia",
  token: "eth"
});

console.log(`ETH faucet tx: https://sepolia.basescan.org/tx/${ethResponse.transactionHash}`);
```

### Option 3: External Faucets

Third-party Base Sepolia faucets (use sparingly):

1. **Coinbase Wallet Faucet**: Available in Coinbase Wallet mobile app
2. **Community Faucets**: Search for "Base Sepolia faucet" (verify legitimacy)

⚠️ **Note**: Always prefer CDP's official faucet for reliability and safety.

## Available Testnet Tokens

### Base Sepolia Network

| Token | Symbol | Decimals | Faucet Amount |
|-------|---------|----------|---------------|
| Ether | ETH | 18 | ~0.1 ETH |
| USD Coin | USDC | 6 | ~$10 USDC |

### Token Addresses (Base Sepolia)

- **ETH**: Native token (no contract address)
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Rate Limits and Restrictions

### CDP Faucet Limits

- **Per Address**: Limited requests per address per day
- **Per IP**: Rate limiting based on IP address  
- **Cooldown**: Waiting period between requests
- **Amount**: Fixed amounts per request

### Best Practices

1. **Use Sparingly**: Only request when needed
2. **Monitor Balances**: Check balances before requesting
3. **Plan Ahead**: Request funds before running out completely
4. **Test Efficiently**: Don't waste testnet tokens on unnecessary transactions

## Checking Account Balances

### Using CDP Dashboard

1. Visit [CDP Server Wallets](https://portal.cdp.coinbase.com/products/server-wallet)
2. Select your wallet/account
3. View token balances

### Programmatically Check Balances

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

async function checkBalances(accountAddress: string) {
  const account = await cdp.evm.getAccount(accountAddress);
  const balances = await account.listTokenBalances({
    network: "base-sepolia"
  });

  console.log("Account balances:");
  balances.balances.forEach(balance => {
    console.log(`${balance.token.symbol}: ${balance.amount}`);
  });
}
```

### Using Block Explorer

1. Visit [Base Sepolia Explorer](https://sepolia.basescan.org/)
2. Search for your account address
3. View token holdings and transaction history

## Transaction Monitoring

### Track Funding Transactions

All faucet transactions can be monitored on Base Sepolia:

```typescript
// Wait for faucet transaction confirmation
const receipt = await publicClient.waitForTransactionReceipt({
  hash: faucetTransactionHash,
});

console.log(`Status: ${receipt.status}`);
console.log(`Block: ${receipt.blockNumber}`);
console.log(`Gas Used: ${receipt.gasUsed}`);
```

### Explorer Links

- **Base Sepolia**: `https://sepolia.basescan.org/tx/{transactionHash}`
- **Address**: `https://sepolia.basescan.org/address/{accountAddress}`

## Troubleshooting Funding Issues

### Common Problems

1. **"Faucet request failed"**
   ```
   Error: Rate limit exceeded
   ```
   **Solution**: Wait for cooldown period, try again later

2. **"Insufficient funds" despite funding**
   ```
   Error: Insufficient balance for transaction
   ```
   **Solutions**:
   - Wait for faucet transaction to confirm
   - Check transaction status on explorer
   - Verify correct network (base-sepolia)

3. **"Account not found"**
   ```
   Error: Account does not exist
   ```
   **Solutions**:
   - Verify account address is correct
   - Ensure account was created successfully
   - Check network configuration

### Debugging Steps

1. **Verify Network Configuration**:
   ```bash
   # Check environment variables
   echo $NETWORK  # Should be "base-sepolia"
   ```

2. **Check Account Creation**:
   ```typescript
   const account = await cdp.evm.getOrCreateAccount({ name: "Test" });
   console.log(`Account: ${account.address}`);
   ```

3. **Monitor Auto-funding**:
   ```typescript
   // Add logging to see when auto-funding triggers
   console.log(`Current USDC balance: ${usdcBalance?.amount || 0}`);
   console.log(`Threshold: 500000 (auto-fund if below)`);
   ```

## Advanced Funding Scenarios

### Funding Multiple Accounts

```typescript
const accounts = ["Purchaser", "Seller", "Custom"];

for (const name of accounts) {
  const account = await cdp.evm.getOrCreateAccount({ name });
  
  try {
    const response = await cdp.evm.requestFaucet({
      address: account.address,
      network: "base-sepolia", 
      token: "usdc"
    });
    
    console.log(`Funded ${name}: ${response.transactionHash}`);
  } catch (error) {
    console.error(`Failed to fund ${name}:`, error.message);
  }
}
```

### Custom Funding Thresholds

```typescript
// Custom auto-funding logic
async function ensureFunding(account: Account, minBalance: number = 1000000) {
  const balances = await account.listTokenBalances({ network: "base-sepolia" });
  const usdcBalance = balances.balances.find(b => b.token.symbol === "USDC");
  
  if (!usdcBalance || Number(usdcBalance.amount) < minBalance) {
    console.log(`Balance ${usdcBalance?.amount || 0} below threshold ${minBalance}`);
    
    const { transactionHash } = await cdp.evm.requestFaucet({
      address: account.address,
      network: "base-sepolia",
      token: "usdc"
    });
    
    console.log(`Requested funding: ${transactionHash}`);
    return transactionHash;
  }
  
  return null;
}
```

## Production Considerations

### Transitioning to Mainnet

When moving to production (`NETWORK=base`):

1. **Disable Auto-funding**: The auto-funding only works on testnet
2. **Manual Funding**: Send real USDC to account addresses
3. **Monitoring**: Implement balance monitoring and alerts
4. **Backup Funding**: Have multiple funding sources

### Funding Strategy for Production

```typescript
// Production funding check (no auto-faucet)
if (env.NETWORK === "base" && (!usdcBalance || Number(usdcBalance.amount) < 5000000)) {
  // Send alert instead of auto-funding
  console.warn(`Production account running low: ${usdcBalance?.amount || 0}`);
  // Implement your alerting logic here
}
```

## Summary

Your x402 project is already configured with automatic Sepolia testnet funding that:

✅ **Automatically requests USDC** when balance < $0.50  
✅ **Works on base-sepolia** network only  
✅ **Waits for confirmation** before proceeding  
✅ **Handles the "Purchaser" account** used for payments  

For manual funding, use:
- 🎯 **CDP Dashboard**: Easiest option
- 🔧 **Programmatic**: For automation  
- 🌐 **Block Explorer**: For monitoring

The automatic funding ensures your AI agents and payment flows never run out of testnet funds during development!
