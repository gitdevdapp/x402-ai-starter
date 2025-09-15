# Sepolia Testnet Documentation

Welcome to the complete documentation for getting Sepolia testnet funds working in your x402 project.

## 📁 Documentation Overview

This folder contains comprehensive guides for working with Sepolia testnet funds and wallet functionality:

### 🚀 [Sepolia Testnet Quickstart](./sepolia-testnet-quickstart.md)
**Start here!** Complete overview of your project's testnet integration, including:
- Current project status and what's already configured
- Prerequisites and CDP account setup  
- How automatic funding works
- Testing the setup
- Moving to production

### ⚙️ [Environment Setup Guide](./environment-setup.md)
Detailed instructions for configuring your development environment:
- Required environment variables
- Getting CDP credentials step-by-step
- Environment file examples
- Vercel deployment configuration
- Security best practices

### 💰 [Testnet Funding Guide](./testnet-funding-guide.md)
Everything about getting and managing testnet funds:
- Automatic funding (already configured)
- Manual funding options
- Available tokens and rate limits
- Transaction monitoring
- Production considerations

### 🔧 [Wallet Usage Guide](./wallet-usage-guide.md)
How to use the existing wallet functionality:
- Pre-configured accounts (Purchaser & Seller)
- Creating custom accounts  
- Sending transactions
- Smart contract interactions
- Integration examples

### 🔍 [Troubleshooting Guide](./troubleshooting.md)
Solutions for common issues:
- Environment and setup problems
- Wallet and account issues
- Faucet and funding problems
- Transaction failures
- Development and production issues

## 🎯 Quick Start Summary

Your project is **already configured** with:

✅ **CDP SDK Integration** - Coinbase Developer Platform v1.36.0  
✅ **Automatic Funding** - USDC faucet when balance < $0.50  
✅ **Two Accounts** - "Purchaser" (pays) and "Seller" (receives)  
✅ **Viem Integration** - Full Ethereum transaction support  
✅ **Base Sepolia** - Testnet configuration  

### To Get Started:

1. **Get CDP credentials** from [CDP Portal](https://portal.cdp.coinbase.com)
2. **Configure environment** variables in `.env.local`
3. **Run the project** with `pnpm dev`
4. **Visit** [http://localhost:3000](http://localhost:3000) to see it working

The app will automatically:
- Create a "Purchaser" account
- Request USDC from the faucet when needed
- Handle all wallet operations for you

## 🔗 Key Resources

- **CDP Portal**: [https://portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
- **Base Sepolia Explorer**: [https://sepolia.basescan.org](https://sepolia.basescan.org)
- **CDP Documentation**: [https://docs.cdp.coinbase.com](https://docs.cdp.coinbase.com)
- **x402 Protocol**: [https://x402.org](https://x402.org)

## 📊 Project Architecture

```
┌─────────────────────┐
│   x402 Next.js     │
│      App           │
├─────────────────────┤
│ • AI Chat           │
│ • Payment Flows     │  
│ • MCP Server        │
│ • API Endpoints     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  CDP Server Wallet  │
├─────────────────────┤
│ • Purchaser Account │ ← Auto-funded
│ • Seller Account    │ ← Receives payments
│ • Transaction Mgmt  │
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

## 🎪 What Makes This Special

This project showcases:

- **x402 Protocol**: Accountless payments for AI agents
- **Server Wallets**: Secure, managed wallet infrastructure  
- **AI Integration**: Agents that can pay for tools and services
- **Automatic Funding**: Never run out of testnet funds
- **Production Ready**: Easy transition from testnet to mainnet

Perfect for building AI applications that need to make payments!

## 🆘 Need Help?

1. **Start with the [Quickstart Guide](./sepolia-testnet-quickstart.md)**
2. **Check [Troubleshooting](./troubleshooting.md)** for common issues
3. **Visit [CDP Community](https://discord.gg/coinbasedev)** for support
4. **Review the existing code** in `src/lib/accounts.ts`

Your testnet integration is ready to go! 🚀
