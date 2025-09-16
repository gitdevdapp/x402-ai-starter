# x402 AI Payment Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fx402-ai-starter&env=CDP_API_KEY_ID,CDP_API_KEY_SECRET,CDP_WALLET_SECRET,VERCEL_AI_GATEWAY_KEY&envDescription=Coinbase%20Developer%20Platform%20credentials%20are%20needed%20to%20create%20and%20fund%20server%20wallets&envLink=https%3A%2F%2Fdocs.cdp.coinbase.com%2Fapi-reference%2Fv2%2Fauthentication&project-name=x402-ai-starter&repository-name=x402-ai-starter&demo-title=x402%20AI%20Payment%20Platform&demo-description=A%20comprehensive%20blockchain%20payment%20platform%20with%20AI%20chat%20and%20USDC%20transfers&demo-url=https%3A%2F%2Fx402-ai-starter.labs.vercel.dev%2F&demo-image=https%3A%2F%2Fx402-ai-starter.labs.vercel.dev%2Fscreenshot.png)

![Screenshot of the app](./public/screenshot-small.png)

A **production-ready blockchain payment platform** combining AI chat capabilities with complete USDC wallet management. Built on [x402](https://x402.org) protocol for accountless payments, featuring real-time balance detection, automated funding, and secure wallet-to-wallet transfers.

**🚀 Status**: ✅ **PRODUCTION READY** - USDC Balance Issues Resolved, Full Transfer Functionality, Comprehensive Documentation

**Demo: [https://x402-ai-starter.vercel.app/](https://x402-ai-starter.vercel.app/)**

## ✨ Key Features

### 🤖 AI Integration
- **AI Chat Interface** with GPT-4o and Gemini 2.0 Flash Lite support
- **AI SDK v5** with OpenAI and Google providers
- **AI Gateway** integration for optimized AI requests
- **AI Elements** for enhanced chat experience

### 💰 Complete Payment System
- **USDC Wallet Management** - Create, fund, and manage wallets
- **Real-time Balance Detection** - Dual-source reading (CDP + direct contract)
- **Automated Funding** - Auto-request USDC when balance < $0.50
- **Wallet-to-Wallet Transfers** - Send USDC between accounts
- **Transaction Tracking** - Real-time updates with explorer links

### 🔐 Security & Infrastructure
- **x402 Protocol** - Accountless payments via HTTP
- **Coinbase CDP Integration** - Enterprise-grade wallet security
- **Server-managed Wallets** - Secure key management
- **Base Sepolia Testnet** - Production-ready test environment
- **Archive System** - Smart wallet organization and cleanup

### 🛠️ Developer Experience
- **Comprehensive Documentation** - Organized docs structure
- **Automated Testing** - End-to-end wallet flow verification
- **Production Deployment** - Vercel-optimized with middleware fixes
- **TypeScript** - Full type safety throughout
- **Modern Stack** - Next.js 15, React, Tailwind CSS

## Tech Stack

- [Next.js](https://nextjs.org/)
- [AI SDK](https://ai-sdk.dev)
- [AI Elements](https://ai-elements.dev)
- [AI Gateway](https://vercel.com/ai-gateway)
- [Coinbase CDP](https://docs.cdp.coinbase.com/)
- [x402](https://x402.org)

## 🚀 Quick Start

### Option 1: Quick Setup (Recommended)
See our **[Quickstart Guide](./docs/current/quickstart-guide.md)** for the fastest way to get running.

### Option 2: Manual Setup
```bash
git clone https://github.com/vercel-labs/x402-ai-starter
cd x402-ai-starter
pnpm install
```

## 🖥️ Local Development

1. **Get CDP Credentials**
   - Sign into the [Coinbase CDP portal](https://portal.cdp.coinbase.com)
   - Create API keys and wallet secret (see **[Environment Setup](./docs/deployment/environment-setup.md)**)

2. **Setup Environment**
   ```bash
   # Create .env.local with required variables
   CDP_API_KEY_ID=your-api-key-id
   CDP_API_KEY_SECRET=your-api-key-secret
   CDP_WALLET_SECRET=your-wallet-secret
   VERCEL_AI_GATEWAY_KEY=your-vercel-ai-key  # Required for AI features
   NETWORK=base-sepolia  # Optional, defaults to base-sepolia
   ```

   > 💡 **AI Gateway**: Get your key from [Vercel AI Gateway dashboard](https://vercel.com/ai-gateway) or use `vc link && vc env pull` for OIDC token

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Open Browser**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Create a wallet and test the full payment flow

## 🧪 Testing & Verification

### Testnet Environment
- **Network**: Base Sepolia (testnet with fake USDC)
- **Auto-funding**: Automatically requests USDC when balance < $0.50
- **Manual funding**: [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet?token=USDC&network=base-sepolia)

### Automated Testing
Visit **`/test/wallet-flow`** for comprehensive end-to-end testing:
- ✅ Wallet creation and initial balance verification
- ✅ USDC funding with real-time balance updates
- ✅ ETH funding verification
- ✅ Transaction tracking with explorer links
- ✅ Archive system functionality

### Manual Testing Steps
1. **Create Wallet** → Verify initial zero balances
2. **Fund with USDC** → Watch real-time progress indicators
3. **Fund with ETH** → Test dual balance detection
4. **Transfer USDC** → Send between wallets
5. **Check History** → View transaction records

## 🚀 Production Deployment

### Quick Deploy
Use the **"Deploy with Vercel"** button above or follow our **[Deployment Guide](./docs/deployment/CANONICAL_DEPLOYMENT_GUIDE.md)**.

### Environment Variables
Set these in your Vercel project settings:
```bash
CDP_API_KEY_ID=your-production-api-key-id
CDP_API_KEY_SECRET=your-production-api-key-secret
CDP_WALLET_SECRET=your-production-wallet-secret
VERCEL_AI_GATEWAY_KEY=your-vercel-ai-gateway-key
NETWORK=base  # Production network
```

> ⚠️ **Critical**: Don't forget `VERCEL_AI_GATEWAY_KEY` - it's required for AI features!

### Mainnet Setup
1. Change `NETWORK=base` in environment variables
2. Fund your production wallets with real USDC via [CDP Dashboard](https://portal.cdp.coinbase.com/products/server-wallet?accountType=evm-eoa)
3. Test thoroughly before going live

### Deployment Resources
- **[Complete Deployment Guide](./docs/deployment/CANONICAL_DEPLOYMENT_GUIDE.md)**
- **[Environment Setup](./docs/deployment/environment-setup.md)**
- **[Troubleshooting](./docs/deployment/troubleshooting.md)**
- **[Vercel Fixes](./docs/deployment/vercel-deployment-fix.md)**

## 📚 Documentation

Our documentation is organized for easy navigation:

### 🎯 **Start Here**
- **[Project State](./docs/current/PROJECT_STATE.md)** - Complete current capabilities and architecture
- **[Quickstart Guide](./docs/current/quickstart-guide.md)** - Get up and running fast

### 🚀 **Deployment**
- **[Deployment Guide](./docs/deployment/CANONICAL_DEPLOYMENT_GUIDE.md)** - Complete production deployment
- **[Environment Setup](./docs/deployment/environment-setup.md)** - Environment configuration
- **[Troubleshooting](./docs/deployment/troubleshooting.md)** - Common issues and solutions

### 🔮 **Future Plans**
- **[Middleware Optimization](./docs/future/middleware-fix-plan.md)** - Architecture improvements
- **[Wallet Reliability](./docs/future/wallet-reliability-fix-plan.md)** - Enhancement plans

### 📚 **Archive**
- **[September 2025](./docs/archive/september-16-2025/)** - Recent fixes and enhancements
- **[December 2024](./docs/archive/december-3-2024/)** - Historical project state

### 📖 **Navigation Guide**
See **[docs/README.md](./docs/README.md)** for a complete overview of our documentation structure.
