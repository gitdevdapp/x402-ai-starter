# Deployment Guide

Complete deployment guide for the x402 blockchain payment application.

## Quick Start

### Prerequisites
- Node.js 22.x+
- pnpm package manager
- CDP (Coinbase Developer Platform) account

### 1. Get CDP Credentials

1. Visit [CDP Portal](https://portal.cdp.coinbase.com)
2. Create API key and download credentials
3. Generate wallet secret

### 2. Environment Setup

Create `.env.local`:
```bash
# CDP Credentials
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret

# Network (base-sepolia for testnet, base for mainnet)
NETWORK=base-sepolia

# Optional: AI Gateway
VERCEL_AI_GATEWAY_KEY=your-vercel-key
```

### 3. Install and Run

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment Options

### Vercel (Recommended)

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET` 
   - `CDP_WALLET_SECRET`
   - `NETWORK` (base-sepolia or base)

### Local Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Network Configuration

### Testnet (Development)
```bash
NETWORK=base-sepolia
```
- Free testnet funds via faucet
- No real money involved
- Automatic funding when balance low

### Mainnet (Production)
```bash
NETWORK=base
```
- Real USDC and ETH required
- Manual funding only
- Production monitoring needed

## Security

### Environment Protection
- Never commit `.env.local` to git
- Store credentials securely in deployment platform
- Use different credentials for different environments

### File Security
```bash
# Ensure these are in .gitignore:
.env.local
.env*
cdp_api_key.json
cdp_wallet_secret.txt
```

## Troubleshooting

### Common Issues

1. **Missing credentials**: Verify all environment variables are set
2. **Network errors**: Check CDP credentials and network configuration
3. **Insufficient funds**: Request from faucet (testnet) or fund manually (mainnet)

### Debug Mode
```bash
# Enable debug logging
DEBUG=cdp:* pnpm dev
```

## Support

- [CDP Documentation](https://docs.cdp.coinbase.com)
- [Base Documentation](https://docs.base.org)
- [Vercel Documentation](https://vercel.com/docs)

## Architecture

The application uses:
- **Frontend**: Next.js with React
- **Backend**: API routes with CDP SDK
- **Wallet**: Server-side CDP wallets
- **Network**: Base (Ethereum L2)
- **Tokens**: ETH for gas, USDC for payments
