# Automated Environment Setup Guide

## Overview

This guide explains how the new automated environment setup works, replacing the manual credential entry process with automatic detection and configuration using the `cdp_api_key.json` and `cdp_wallet_secret.txt` files.

## 🎯 Quick Start

### For New Developers

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vercel-x402
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Place your credential files** (obtained from CDP Portal)
   ```bash
   # Place these files in the project root:
   # - cdp_api_key.json
   # - cdp_wallet_secret.txt
   ```

4. **Run automated setup**
   ```bash
   npm run setup:env
   ```

5. **Start development**
   ```bash
   pnpm dev
   ```

That's it! The system automatically:
- ✅ Validates your credential files
- ✅ Generates `.env.local` with proper formatting
- ✅ Tests CDP connection
- ✅ Starts the development server

## 🔧 Automated Setup Process

### Step 1: Credential File Detection

The system automatically detects and validates:

**cdp_api_key.json** (from CDP Portal):
```json
{
   "id": "your-api-key-id",
   "privateKey": "your-private-key"
}
```

**cdp_wallet_secret.txt** (from CDP Portal):
```
your-wallet-secret-key-here
```

### Step 2: Environment Generation

Automatically creates `.env.local`:
```bash
# Auto-generated environment file
# Generated on: 2024-01-15T10:30:00.000Z
# Source: cdp_api_key.json and cdp_wallet_secret.txt

# CDP Credentials
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-private-key
CDP_WALLET_SECRET=your-wallet-secret-key

# Network Configuration
NETWORK=base-sepolia

# Optional: Vercel AI Gateway Key
# VERCEL_AI_GATEWAY_KEY=your-vercel-ai-gateway-key
```

### Step 3: Validation and Testing

The system automatically:
- Validates all required environment variables are present
- Tests CDP client initialization
- Verifies network connectivity
- Creates a test account to confirm credentials work

## 🛠 Available Commands

### Setup Commands

```bash
# Full automated setup with interactive wizard
npm run setup:env

# Check environment status (auto-fix if needed)
npm run setup:check

# Interactive setup wizard with guided configuration
npm run setup:wizard

# Validate existing environment
npm run env:validate

# Rotate/update credentials (with backup)
npm run env:rotate
```

### Development Commands

```bash
# Start development (with auto environment check)
pnpm dev

# Build for production (with environment validation)
pnpm build

# Run tests with environment verification
pnpm test
```

### Backup and Recovery Commands

```bash
# Backup current environment
npm run env:backup

# Restore from backup
npm run env:restore

# Show environment status
npm run env:status
```

## 🎛 Configuration Options

### Network Selection

The system supports multiple networks:

```bash
# For development (default)
NETWORK=base-sepolia

# For production
NETWORK=base
```

### Interactive Configuration

Run the setup wizard for guided configuration:

```bash
npm run setup:wizard
```

The wizard will ask:
- Which network to use (testnet vs mainnet)
- Whether to include Vercel AI Gateway
- Custom URL configuration
- Additional environment variables

### Environment Templates

Choose from predefined templates:

```bash
# Development template (testnet, debug enabled)
npm run setup:env -- --template=development

# Production template (mainnet, optimized)
npm run setup:env -- --template=production

# Minimal template (required variables only)
npm run setup:env -- --template=minimal
```

## 🔍 Troubleshooting

### Common Issues and Auto-Fixes

#### 1. Missing Credential Files
```bash
❌ Error: cdp_api_key.json not found

💡 Solution: The system will guide you to:
   1. Visit CDP Portal: https://portal.cdp.coinbase.com
   2. Generate API key and download cdp_api_key.json
   3. Create wallet secret and save to cdp_wallet_secret.txt
```

#### 2. Invalid Credential Format
```bash
❌ Error: Failed to parse CDP API key

💡 Auto-fix: The system will:
   1. Backup malformed file
   2. Show expected format
   3. Offer to recreate from wizard
```

#### 3. Existing Environment Conflicts
```bash
⚠️  Warning: Existing .env.local found

💡 Auto-resolution:
   1. Backup existing file (.env.local.backup)
   2. Generate new environment
   3. Merge non-conflicting variables
```

### Validation Errors

The system performs comprehensive validation:

```bash
🔍 Validating environment...
   ✅ CDP_API_KEY_ID present and valid format
   ✅ CDP_API_KEY_SECRET present and valid format  
   ✅ CDP_WALLET_SECRET present and valid format
   ✅ Network configuration valid
   ⚠️  VERCEL_AI_GATEWAY_KEY not set (optional)
   
🌐 Testing CDP connection...
   ✅ API key authentication successful
   ✅ Wallet secret validation passed
   ✅ Test account creation successful
   
🎉 Environment validation complete!
```

### Recovery Options

If something goes wrong:

```bash
# Restore from backup
npm run env:restore

# Reset to manual setup
npm run env:reset

# Show help for manual setup
npm run setup:help
```

## 🔒 Security Features

### Automatic Protection

The system automatically:
- Adds credential files to `.gitignore`
- Sets secure file permissions
- Validates gitignore protection
- Warns about potential security issues

### Security Validation

```bash
🔒 Security Check...
   ✅ cdp_api_key.json is gitignored
   ✅ cdp_wallet_secret.txt is gitignored
   ✅ .env.local is gitignored
   ✅ No credentials in git history
   ✅ File permissions are secure
```

### Credential Protection

The system never:
- Logs sensitive credential values
- Exposes credentials in error messages
- Stores credentials in temporary files
- Transmits credentials unnecessarily

## 🚀 Advanced Usage

### Multiple Environments

Support for different environments:

```bash
# Development environment
npm run setup:env -- --env=development

# Staging environment  
npm run setup:env -- --env=staging

# Production environment
npm run setup:env -- --env=production
```

Environment-specific credential files:
```
credentials/
├── development/
│   ├── cdp_api_key.json
│   └── cdp_wallet_secret.txt
├── staging/
│   ├── cdp_api_key.json
│   └── cdp_wallet_secret.txt
└── production/
    ├── cdp_api_key.json
    └── cdp_wallet_secret.txt
```

### CI/CD Integration

Automated setup in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Setup Environment
  env:
    CDP_API_KEY_ID: ${{ secrets.CDP_API_KEY_ID }}
    CDP_API_KEY_SECRET: ${{ secrets.CDP_API_KEY_SECRET }}
    CDP_WALLET_SECRET: ${{ secrets.CDP_WALLET_SECRET }}
  run: |
    npm run setup:env -- --from-env
```

### Custom Configuration

Advanced configuration options:

```bash
# Custom credential file locations
npm run setup:env -- --api-key-path=./custom/api-key.json

# Custom network endpoints
npm run setup:env -- --network=custom --rpc-url=https://custom.rpc.url

# Include additional variables
npm run setup:env -- --include-extras
```

## 📊 Monitoring and Logging

### Setup Logs

Detailed logging during setup:

```bash
[2024-01-15 10:30:00] 🔧 Starting environment setup...
[2024-01-15 10:30:01] 📋 Validating credential files...
[2024-01-15 10:30:01] ✅ Found cdp_api_key.json (valid format)
[2024-01-15 10:30:01] ✅ Found cdp_wallet_secret.txt (valid format)
[2024-01-15 10:30:02] ⚙️  Generating .env.local...
[2024-01-15 10:30:02] 💾 Backed up existing .env.local
[2024-01-15 10:30:03] 🔍 Validating generated environment...
[2024-01-15 10:30:04] 🌐 Testing CDP connection...
[2024-01-15 10:30:05] ✅ Setup complete! (5.2s)
```

### Environment Status

Monitor environment health:

```bash
npm run env:status

Environment Status Report
========================
✅ Credential files: Present and valid
✅ Environment file: Generated and valid
✅ CDP connection: Active and healthy
✅ Network: base-sepolia (testnet)
⚠️  Last setup: 2 days ago (consider refresh)

Accounts:
- Purchaser: 0x3c0D84055994c3062819Ce8730869D0aDeA4c3Bf (funded)
- Seller: 0x742d35Cc6634C0532925a3b8D0c9dd0c0C3b6CE (active)

Next actions:
- Run 'npm run env:refresh' to update environment
- Run 'pnpm dev' to start development server
```

## 🔄 Migration from Manual Setup

### Existing Project Migration

If you have an existing manual setup:

1. **Backup existing configuration**
   ```bash
   cp .env.local .env.local.manual.backup
   ```

2. **Obtain credential files** from CDP Portal
   - Download `cdp_api_key.json`
   - Create `cdp_wallet_secret.txt`

3. **Run migration**
   ```bash
   npm run setup:migrate
   ```

4. **Verify migration**
   ```bash
   npm run env:validate
   pnpm dev
   ```

### Migration Validation

The migration process:
- Preserves existing non-CDP environment variables
- Validates credential compatibility
- Provides rollback options
- Tests functionality before completion

## 📚 Related Documentation

- **[Migration Plan](./migration-plan.md)** - Complete migration strategy
- **[Security Guide](./security-improvements.md)** - Enhanced security measures
- **[Credential Management](./credential-management.md)** - Advanced credential handling
- **[Troubleshooting](../current/troubleshooting.md)** - Issue resolution

---

**The automated setup transforms a 10-minute manual process into a 30-second automated one, while improving security and reducing errors.**
