# Wallet Usage Guide

## Overview

This guide explains how to use the existing wallet functionality in your x402 project. The project uses Coinbase Developer Platform (CDP) Server Wallet v2 for secure, server-side wallet management.

## Current Wallet Architecture

### Key Components

```
src/lib/accounts.ts     ← Main wallet functions
src/lib/env.ts         ← Environment configuration  
src/app/api/*/route.ts ← API endpoints using wallets
```

### Pre-configured Accounts

The project manages two main accounts:

1. **Purchaser Account**: Pays for services and tools
2. **Seller Account**: Receives payments

## Core Wallet Functions

### 1. Get or Create Purchaser Account

```typescript
import { getOrCreatePurchaserAccount } from "@/lib/accounts";

// Automatically creates account named "Purchaser" if it doesn't exist
// Includes auto-funding logic for testnet
const account = await getOrCreatePurchaserAccount();
console.log(`Purchaser address: ${account.address}`);
```

**Features**:
- ✅ **Auto-creation**: Creates account if it doesn't exist
- ✅ **Auto-funding**: Requests USDC from faucet when balance < $0.50 (testnet only)
- ✅ **Balance checking**: Monitors USDC balance automatically
- ✅ **Transaction confirmation**: Waits for funding transaction to confirm

### 2. Get or Create Seller Account

```typescript
import { getOrCreateSellerAccount } from "@/lib/accounts";

// Creates account named "Seller" for receiving payments
const account = await getOrCreateSellerAccount();
console.log(`Seller address: ${account.address}`);
```

**Features**:
- ✅ **Auto-creation**: Creates account if it doesn't exist
- ❌ **No auto-funding**: Seller accounts are funded by receiving payments

## Creating Custom Accounts

### Basic Account Creation

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

// Create unnamed account
const account = await cdp.evm.createAccount();
console.log(`New account: ${account.address}`);

// Create named account (recommended)
const namedAccount = await cdp.evm.getOrCreateAccount({
  name: "MyCustomAccount"
});
console.log(`Named account: ${namedAccount.address}`);
```

### Account with Custom Funding

```typescript
import { toAccount } from "viem/accounts";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";

const cdp = new CdpClient();

async function createFundedAccount(name: string, minBalance: number = 1000000) {
  // Create or get existing account
  const cdpAccount = await cdp.evm.getOrCreateAccount({ name });
  
  // Check balance
  const balances = await cdpAccount.listTokenBalances({
    network: env.NETWORK,
  });
  
  const usdcBalance = balances.balances.find(
    (balance) => balance.token.symbol === "USDC"
  );
  
  // Fund if needed (testnet only)
  if (
    env.NETWORK === "base-sepolia" &&
    (!usdcBalance || Number(usdcBalance.amount) < minBalance)
  ) {
    console.log(`Funding account ${name}...`);
    const { transactionHash } = await cdp.evm.requestFaucet({
      address: cdpAccount.address,
      network: env.NETWORK,
      token: "usdc",
    });
    
    console.log(`Funding tx: https://sepolia.basescan.org/tx/${transactionHash}`);
  }
  
  return toAccount(cdpAccount);
}

// Usage
const customAccount = await createFundedAccount("MyApp");
```

## Sending Transactions

### Using Existing Wallet Client

```typescript
import { createWalletClient, http, parseEther } from "viem";
import { getOrCreatePurchaserAccount, chain } from "@/lib/accounts";

// Create wallet client with purchaser account
const account = await getOrCreatePurchaserAccount();
const walletClient = createWalletClient({
  chain,
  transport: http(),
  account,
});

// Send ETH transaction
const hash = await walletClient.sendTransaction({
  to: "0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE",
  value: parseEther("0.001"),
});

console.log(`Transaction: https://sepolia.basescan.org/tx/${hash}`);
```

### Using CDP Client Directly

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";
import { parseEther } from "viem";
import { env } from "@/lib/env";

const cdp = new CdpClient();

// Send transaction using CDP
const transactionResult = await cdp.evm.sendTransaction({
  address: account.address,
  transaction: {
    to: "0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE",
    value: parseEther("0.001"),
  },
  network: env.NETWORK,
});

console.log(`CDP Transaction: ${transactionResult.transactionHash}`);
```

## Smart Contract Interactions

### ERC-20 Token Transfers

```typescript
import { erc20Abi, parseUnits } from "viem";

// USDC contract address on Base Sepolia
const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Transfer USDC using wallet client
const hash = await walletClient.writeContract({
  address: usdcAddress,
  abi: erc20Abi,
  functionName: "transfer",
  args: [
    "0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE", // recipient
    parseUnits("1.0", 6), // 1 USDC (6 decimals)
  ],
});

console.log(`USDC transfer: https://sepolia.basescan.org/tx/${hash}`);
```

### Reading Contract Data

```typescript
import { createPublicClient, http } from "viem";
import { chain } from "@/lib/accounts";

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

// Read USDC balance
const balance = await publicClient.readContract({
  address: usdcAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [account.address],
});

console.log(`USDC balance: ${balance}`);
```

## Account Management

### List All Accounts

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

async function listAllAccounts() {
  const accounts = await cdp.evm.listAccounts();
  
  console.log("All accounts:");
  for (const account of accounts) {
    console.log(`- ${account.name || "Unnamed"}: ${account.address}`);
    
    // Get balances for each account
    const balances = await account.listTokenBalances({
      network: env.NETWORK,
    });
    
    balances.balances.forEach(balance => {
      console.log(`  ${balance.token.symbol}: ${balance.amount}`);
    });
  }
}
```

### Export Account Details

```typescript
async function exportAccountInfo(accountName: string) {
  const account = await cdp.evm.getOrCreateAccount({ name: accountName });
  
  return {
    name: accountName,
    address: account.address,
    network: env.NETWORK,
    balances: await account.listTokenBalances({ network: env.NETWORK }),
    transactions: await account.listTransactions({ network: env.NETWORK }),
  };
}

// Usage
const purchaserInfo = await exportAccountInfo("Purchaser");
console.log(JSON.stringify(purchaserInfo, null, 2));
```

## Integration Examples

### API Route with Wallet

```typescript
// src/app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePurchaserAccount } from "@/lib/accounts";
import { createWalletClient, http, parseUnits } from "viem";
import { chain } from "@/lib/accounts";

export async function POST(request: NextRequest) {
  try {
    const { to, amount } = await request.json();
    
    // Get purchaser account (auto-funded on testnet)
    const account = await getOrCreatePurchaserAccount();
    
    // Create wallet client
    const walletClient = createWalletClient({
      chain,
      transport: http(),
      account,
    });
    
    // Send USDC payment
    const hash = await walletClient.writeContract({
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, parseUnits(amount, 6)],
    });
    
    return NextResponse.json({
      success: true,
      transactionHash: hash,
      explorer: `https://sepolia.basescan.org/tx/${hash}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### React Component Using Wallet

```typescript
// src/components/WalletStatus.tsx
import { useEffect, useState } from "react";

interface WalletInfo {
  address: string;
  usdcBalance: string;
  ethBalance: string;
}

export function WalletStatus() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  
  useEffect(() => {
    async function loadWalletInfo() {
      const response = await fetch("/api/wallet/status");
      const data = await response.json();
      setWallet(data);
    }
    
    loadWalletInfo();
  }, []);
  
  if (!wallet) return <div>Loading wallet...</div>;
  
  return (
    <div className="p-4 border rounded">
      <h3>Wallet Status</h3>
      <p>Address: {wallet.address}</p>
      <p>USDC: ${wallet.usdcBalance}</p>
      <p>ETH: {wallet.ethBalance} ETH</p>
    </div>
  );
}
```

## Advanced Features

### Multi-signature Accounts

```typescript
// Note: CDP SDK v1.36.0 supports smart accounts
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

// Create smart account (if supported)
const smartAccount = await cdp.evm.createSmartAccount({
  owners: [
    "0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE",
    "0x123...", // Additional owners
  ],
  threshold: 2, // Require 2 signatures
});
```

### Batch Transactions

```typescript
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";

// Prepare multiple transactions
const transactions = [
  {
    to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: ["0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE", parseUnits("1", 6)],
    }),
  },
  // Add more transactions...
];

// Execute batch (implementation depends on account type)
```

## Monitoring and Logging

### Transaction Tracking

```typescript
import { createPublicClient, http } from "viem";
import { chain } from "@/lib/accounts";

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

async function waitForTransaction(hash: string) {
  console.log(`Waiting for transaction: ${hash}`);
  
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: hash as `0x${string}`,
  });
  
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed}`);
  console.log(`Status: ${receipt.status}`);
  
  return receipt;
}
```

### Balance Monitoring

```typescript
async function monitorBalances(accountName: string, interval: number = 30000) {
  const account = await cdp.evm.getOrCreateAccount({ name: accountName });
  
  setInterval(async () => {
    const balances = await account.listTokenBalances({
      network: env.NETWORK,
    });
    
    console.log(`${accountName} balances:`);
    balances.balances.forEach(balance => {
      console.log(`  ${balance.token.symbol}: ${balance.amount}`);
    });
  }, interval);
}

// Monitor purchaser account every 30 seconds
monitorBalances("Purchaser");
```

## Best Practices

### 1. Error Handling

```typescript
async function safeWalletOperation() {
  try {
    const account = await getOrCreatePurchaserAccount();
    // ... wallet operations
  } catch (error) {
    if (error.message.includes("insufficient funds")) {
      console.error("Insufficient balance for transaction");
      // Handle funding logic
    } else if (error.message.includes("rate limit")) {
      console.error("Rate limited by faucet");
      // Wait and retry
    } else {
      console.error("Wallet operation failed:", error);
      // Handle other errors
    }
  }
}
```

### 2. Gas Estimation

```typescript
// Estimate gas before sending transaction
const gasEstimate = await publicClient.estimateGas({
  account: account.address,
  to: "0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE",
  value: parseEther("0.001"),
});

console.log(`Estimated gas: ${gasEstimate}`);
```

### 3. Account Security

```typescript
// Never expose private keys or wallet secrets
// Use environment variables for credentials
// Implement proper access controls for account operations
// Monitor account activity for unusual transactions
```

## Summary

Your x402 project provides:

✅ **Two pre-configured accounts**: Purchaser (auto-funded) and Seller  
✅ **Automatic testnet funding**: USDC faucet when balance is low  
✅ **Viem integration**: Full Ethereum transaction support  
✅ **CDP SDK**: Complete wallet management capabilities  
✅ **Network flexibility**: Easy switching between testnet and mainnet  

Key functions to use:
- `getOrCreatePurchaserAccount()` - For sending payments/transactions
- `getOrCreateSellerAccount()` - For receiving payments
- CDP client - For advanced wallet operations
- Viem wallet client - For Ethereum transactions

Your wallets are ready for both development testing and production use!
