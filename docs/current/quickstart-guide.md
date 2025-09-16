# 🚀 x402 Sepolia Testnet Quickstart

**Get your AI payment app running in 3 minutes!**

## What You Get

✅ **AI Chat App** with payment capabilities  
✅ **Auto-funded testnet wallet** (USDC on Base Sepolia)  
✅ **Two accounts**: Purchaser (pays) & Seller (receives)  
✅ **Real blockchain transactions** without real money  

## Prerequisites

- Node.js 22+ with pnpm
- [CDP Account](https://portal.cdp.coinbase.com/create-account) (free)

## Setup (3 Steps)

### 1. Get CDP Credentials

1. Sign in to [CDP Portal](https://portal.cdp.coinbase.com)
2. **API Key**: Go to [API Keys](https://portal.cdp.coinbase.com/projects/api-keys) → "Create API Key"
3. **Wallet Secret**: Go to [Server Wallets](https://portal.cdp.coinbase.com/products/server-wallets) → "Generate Wallet Secret"

Save as:
- `cdp_api_key.json` (contains id + privateKey)
- `cdp_wallet_secret.txt` (contains the secret string)

### 2. Setup Environment

**Option A: Automatic** (recommended)
```bash
node setup-env.js  # Creates .env.local automatically
```

**Option B: Manual**
```bash
# Create .env.local with:
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret  
CDP_WALLET_SECRET=your-wallet-secret
NETWORK=base-sepolia
```

### 3. Run & Test

```bash
pnpm install
node test-sepolia.js  # Test funding (optional)
pnpm dev
```

Visit: **http://localhost:3000**

## What Happens

1. **Account Creation**: App creates "Purchaser" account automatically
2. **Auto-funding**: Requests $1 USDC from testnet faucet when balance < $0.50
3. **Ready to Use**: Make payments, test AI features, see real transactions

## Key Files

- `src/lib/accounts.ts` - Wallet management
- `src/lib/env.ts` - Environment validation
- `.env.local` - Your credentials (auto-gitignored)

## Troubleshooting

**Authentication Error**
- Check CDP credentials in `.env.local`
- Verify API key permissions in CDP portal

**Funding Failed** 
- Faucet rate limits: Wait 24h between requests
- Manual funding: [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet)

**Environment Issues**
- Ensure all required variables are set
- Check for typos in `.env.local`

## Going to Production

Change one line in `.env.local`:
```bash
NETWORK=base  # Switch from base-sepolia to base mainnet
```

Fund accounts with real USDC via CDP dashboard.

## Architecture

```
x402 App → CDP Server Wallet → Base Sepolia → Auto-funded USDC
```

**That's it!** Your testnet is ready for AI payments. 🎉

---

**Need help?** Check the detailed guides in `docs/current/` or visit [CDP Community](https://discord.gg/coinbasedev)
