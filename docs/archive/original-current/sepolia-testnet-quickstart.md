# Sepolia Testnet Integration Guide

## Overview

This project is already configured with Coinbase Developer Platform (CDP) Server Wallet v2 integration for Sepolia testnet access. This guide will help you get up and running with testnet funds and understand how the existing wallet functionality works.

## Current Project Status

✅ **Already Configured:**
- CDP SDK integration (`@coinbase/cdp-sdk` v1.36.0)
- Viem for Ethereum interactions (v2.37.3)
- Base Sepolia testnet configuration
- Automatic faucet funding when USDC balance is low
- Server-side wallet management with "Purchaser" and "Seller" accounts

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** 22.x+ (required for this Next.js project)
2. **pnpm** package manager
3. **CDP Account**: [Create](https://portal.cdp.coinbase.com/create-account) and [sign in](https://portal.cdp.coinbase.com/signin) to CDP portal

## Quick Start

### 1. Get CDP API Credentials

1. Sign in to the [CDP Portal](https://portal.cdp.coinbase.com)
2. [Create a CDP API key](https://portal.cdp.coinbase.com/projects/api-keys)
3. [Generate a Wallet Secret](https://portal.cdp.coinbase.com/products/server-wallets)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required CDP credentials
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret

# Network configuration (defaults to base-sepolia for testnet)
NETWORK=base-sepolia

# Optional: Vercel AI Gateway (for AI features)
VERCEL_AI_GATEWAY_KEY=your-vercel-ai-gateway-key
```

### 3. Install Dependencies and Run

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app in action.

## How Testnet Funding Works

The project includes **automatic testnet funding** via the existing `getOrCreatePurchaserAccount()` function in `src/lib/accounts.ts`:

### Automatic Funding Logic

```typescript
// Automatically requests USDC from faucet if balance < $0.50
if (
  env.NETWORK === "base-sepolia" &&
  (!usdcBalance || Number(usdcBalance.amount) < 500000)
) {
  const { transactionHash } = await cdp.evm.requestFaucet({
    address: account.address,
    network: env.NETWORK,
    token: "usdc",
  });
}
```

### Available Testnet Tokens

The CDP Faucet supports:
- **ETH** on Base Sepolia
- **USDC** on Base Sepolia (used by this project)

### Manual Funding Options

1. **CDP Dashboard**: [Coinbase CDP Faucet](https://portal.cdp.coinbase.com/products/faucet?token=USDC&network=base-sepolia)
2. **Programmatically**: Using the existing CDP client (already configured)

```typescript
// Example: Manual ETH funding
const { transactionHash } = await cdp.evm.requestFaucet({
  address: account.address,
  network: "base-sepolia",
  token: "eth"
});
```

## Existing Wallet Accounts

The project creates and manages two accounts:

### 1. Purchaser Account
- **Purpose**: Pays for tools and services (AI agent payments)
- **Auto-funding**: Yes (USDC when balance < $0.50)
- **Usage**: Bot API, payment flows

### 2. Seller Account
- **Purpose**: Receives payments from purchasers
- **Auto-funding**: No
- **Usage**: Service providers, paywall recipients

## Testing the Setup

### 1. Check Account Creation

Visit `/playground` to test account creation and see wallet addresses.

### 2. Verify Funding

The app will automatically:
1. Create a "Purchaser" account
2. Check USDC balance
3. Request funds from faucet if needed
4. Wait for transaction confirmation

### 3. Monitor Transactions

All testnet transactions can be viewed on:
- **Base Sepolia Explorer**: https://sepolia.basescan.org/

## Integration Examples

### Creating Additional Accounts

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

// Create a new EVM account
const account = await cdp.evm.createAccount();
console.log(`Created account: ${account.address}`);

// Or get/create named account
const namedAccount = await cdp.evm.getOrCreateAccount({
  name: "MyCustomAccount"
});
```

### Sending Transactions

```typescript
import { parseEther } from "viem";

const transactionResult = await cdp.evm.sendTransaction({
  address: account.address,
  transaction: {
    to: "0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE",
    value: parseEther("0.001"), // 0.001 ETH
  },
  network: "base-sepolia",
});

console.log(`Transaction: https://sepolia.basescan.org/tx/${transactionResult.transactionHash}`);
```

## Troubleshooting

### Common Issues

1. **"Insufficient funds" errors**
   - Check account balance in CDP dashboard
   - Ensure faucet limits haven't been exceeded
   - Wait for previous faucet transactions to confirm

2. **Authentication errors**
   - Verify CDP credentials in `.env.local`
   - Ensure API key has correct permissions
   - Check that Wallet Secret is valid

3. **Network issues**
   - Confirm `NETWORK=base-sepolia` in environment
   - Check RPC endpoint connectivity
   - Verify testnet is operational

### Rate Limits

CDP Faucets have rate limits:
- Check current limits in [CDP Faucet docs](https://docs.cdp.coinbase.com/faucets/introduction/welcome#supported-assets)
- Use sparingly in development
- Consider manual funding for heavy testing

## Moving to Production

When ready for mainnet:

1. **Update Network**: Set `NETWORK=base` in environment variables
2. **Fund Accounts**: Send real USDC to account addresses via CDP dashboard
3. **Monitor Balances**: Implement monitoring for production account balances
4. **Remove Auto-funding**: The auto-faucet logic only runs on `base-sepolia`

## Resources

- [CDP Server Wallet v2 Docs](https://docs.cdp.coinbase.com/server-wallets/v2/)
- [CDP API Reference](https://docs.cdp.coinbase.com/api-reference/v2/)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [CDP Portal Dashboard](https://portal.cdp.coinbase.com/)

## Architecture Overview

```
┌─────────────────────┐
│   Next.js App      │
├─────────────────────┤
│ src/lib/accounts.ts │ ← Wallet management
│ src/lib/env.ts      │ ← Environment config
│ src/app/api/        │ ← API endpoints with wallet integration
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   CDP SDK Client    │
├─────────────────────┤
│ • Account creation  │
│ • Transaction signing│
│ • Faucet requests   │
│ • Balance checking  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Base Sepolia       │
├─────────────────────┤
│ • Testnet ETH       │
│ • Testnet USDC      │
│ • Free transactions │
└─────────────────────┘
```

This setup provides a complete testnet environment for developing and testing blockchain payments without real money.
