# Migration Plan: Automated CDP Credential Setup

## Executive Summary

This document outlines the complete migration plan to automate the creation of `.env.local` from the existing `cdp_api_key.json` and `cdp_wallet_secret.txt` files, while ensuring all sensitive credentials are properly protected from git commits.

## Current State Analysis

### Existing Files and Structure
```
/vercel-x402/
├── cdp_api_key.json         # Contains CDP API credentials
├── cdp_wallet_secret.txt    # Contains wallet secret key
├── src/lib/env.ts          # Environment validation schema
├── docs/current/           # Current manual setup documentation
└── .gitignore             # Now updated with credential protection
```

### Current Credential Structure

**cdp_api_key.json:**
```json
{
   "id": "your-cdp-api-key-id",
   "privateKey": "your-cdp-private-key"
}
```

**cdp_wallet_secret.txt:**
```
your-wallet-secret-content
```

### Required Environment Variables
Based on `src/lib/env.ts`:
- `CDP_WALLET_SECRET` (required)
- `CDP_API_KEY_ID` (required) 
- `CDP_API_KEY_SECRET` (required)
- `NETWORK` (optional, defaults to "base-sepolia")
- `VERCEL_AI_GATEWAY_KEY` (required)
- `URL` (optional, defaults to "http://localhost:3000")

## Migration Strategy

### Phase 1: Security Hardening ✅ COMPLETED

**Objective**: Ensure all sensitive files are protected from git commits

**Actions Completed**:
- [x] Updated `.gitignore` to include:
  - `cdp_api_key.json`
  - `cdp_wallet_secret.txt`
  - `*.pem`, `*.key`, `*_secret.txt`, `*_secret.json`
- [x] Verified existing `.env*` protection is in place
- [x] Documented current credential file contents

**Security Verification**:
```bash
git status
# Should show cdp files as untracked but ignored
git check-ignore cdp_api_key.json cdp_wallet_secret.txt
# Should return the file names (meaning they're ignored)
```

### Phase 2: Automation Framework Implementation

**Objective**: Create automated credential parsing and `.env.local` generation

#### Step 2.1: Create Credential Parsing Utilities

**File**: `scripts/credential-parser.js`
```javascript
import fs from 'fs';
import path from 'path';

export class CredentialParser {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.apiKeyPath = path.join(rootDir, 'cdp_api_key.json');
    this.walletSecretPath = path.join(rootDir, 'cdp_wallet_secret.txt');
  }

  async parseApiKey() {
    try {
      const content = fs.readFileSync(this.apiKeyPath, 'utf8');
      const data = JSON.parse(content);
      return {
        id: data.id,
        privateKey: data.privateKey
      };
    } catch (error) {
      throw new Error(`Failed to parse CDP API key: ${error.message}`);
    }
  }

  async parseWalletSecret() {
    try {
      const content = fs.readFileSync(this.walletSecretPath, 'utf8').trim();
      return content;
    } catch (error) {
      throw new Error(`Failed to parse wallet secret: ${error.message}`);
    }
  }

  async validateCredentials() {
    const errors = [];
    
    if (!fs.existsSync(this.apiKeyPath)) {
      errors.push('cdp_api_key.json not found');
    }
    
    if (!fs.existsSync(this.walletSecretPath)) {
      errors.push('cdp_wallet_secret.txt not found');
    }

    if (errors.length > 0) {
      throw new Error(`Credential validation failed: ${errors.join(', ')}`);
    }

    // Test parsing
    try {
      await this.parseApiKey();
      await this.parseWalletSecret();
    } catch (error) {
      throw new Error(`Credential format validation failed: ${error.message}`);
    }

    return true;
  }
}
```

#### Step 2.2: Create Environment Generator

**File**: `scripts/env-generator.js`
```javascript
import fs from 'fs';
import path from 'path';
import { CredentialParser } from './credential-parser.js';

export class EnvGenerator {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.envPath = path.join(rootDir, '.env.local');
    this.parser = new CredentialParser(rootDir);
  }

  async generateEnvLocal() {
    // Validate and parse credentials
    await this.parser.validateCredentials();
    const apiKey = await this.parser.parseApiKey();
    const walletSecret = await this.parser.parseWalletSecret();

    // Generate .env.local content
    const envContent = this.buildEnvContent(apiKey, walletSecret);

    // Backup existing .env.local if it exists
    await this.backupExistingEnv();

    // Write new .env.local
    fs.writeFileSync(this.envPath, envContent, 'utf8');

    return {
      success: true,
      path: this.envPath,
      backedUp: fs.existsSync(this.envPath + '.backup')
    };
  }

  buildEnvContent(apiKey, walletSecret) {
    const template = `# Auto-generated environment file
# Generated on: ${new Date().toISOString()}
# Source: cdp_api_key.json and cdp_wallet_secret.txt

# CDP Credentials
CDP_API_KEY_ID=${apiKey.id}
CDP_API_KEY_SECRET=${apiKey.privateKey}
CDP_WALLET_SECRET=${walletSecret}

# Network Configuration (base-sepolia for testnet, base for mainnet)
NETWORK=base-sepolia

# Optional: Vercel AI Gateway Key
# VERCEL_AI_GATEWAY_KEY=your-vercel-ai-gateway-key

# Optional: Custom URL (defaults to http://localhost:3000)
# URL=http://localhost:3000
`;

    return template;
  }

  async backupExistingEnv() {
    if (fs.existsSync(this.envPath)) {
      const backupPath = this.envPath + '.backup';
      fs.copyFileSync(this.envPath, backupPath);
      console.log(`Backed up existing .env.local to ${backupPath}`);
    }
  }

  validateEnvFile() {
    if (!fs.existsSync(this.envPath)) {
      throw new Error('.env.local file not found');
    }

    const content = fs.readFileSync(this.envPath, 'utf8');
    const requiredVars = [
      'CDP_API_KEY_ID',
      'CDP_API_KEY_SECRET', 
      'CDP_WALLET_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => 
      !content.includes(`${varName}=`)
    );

    if (missingVars.length > 0) {
      throw new Error(`Missing required variables in .env.local: ${missingVars.join(', ')}`);
    }

    return true;
  }
}
```

#### Step 2.3: Create Setup Script

**File**: `scripts/setup-env.js`
```javascript
#!/usr/bin/env node
import { EnvGenerator } from './env-generator.js';
import { CredentialParser } from './credential-parser.js';

async function main() {
  console.log('🔧 Setting up environment from CDP credential files...\n');

  try {
    const generator = new EnvGenerator();
    
    // Validate credential files exist and are parseable
    console.log('📋 Validating credential files...');
    await generator.parser.validateCredentials();
    console.log('✅ Credential files validated\n');

    // Generate .env.local
    console.log('⚙️  Generating .env.local...');
    const result = await generator.generateEnvLocal();
    
    if (result.backedUp) {
      console.log('💾 Existing .env.local backed up');
    }
    
    console.log(`✅ Generated ${result.path}\n`);

    // Validate the generated file
    console.log('🔍 Validating generated environment...');
    generator.validateEnvFile();
    console.log('✅ Environment validation passed\n');

    // Test CDP connection
    console.log('🌐 Testing CDP connection...');
    await testCdpConnection();
    console.log('✅ CDP connection successful\n');

    console.log('🎉 Environment setup complete!');
    console.log('   You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n📖 Troubleshooting:');
    console.error('   1. Ensure cdp_api_key.json and cdp_wallet_secret.txt exist');
    console.error('   2. Verify credential file formats are correct');
    console.error('   3. Check CDP portal for valid credentials');
    console.error('   4. See docs/current/troubleshooting.md for more help');
    process.exit(1);
  }
}

async function testCdpConnection() {
  // Import and test CDP client initialization
  try {
    const { CdpClient } = await import('@coinbase/cdp-sdk');
    const cdp = new CdpClient();
    
    // Simple test - create a temporary account to verify credentials
    const testAccount = await cdp.evm.createAccount();
    console.log(`   Test account created: ${testAccount.address.slice(0, 10)}...`);
    
  } catch (error) {
    throw new Error(`CDP connection test failed: ${error.message}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

#### Step 2.4: Package.json Integration

**Add to package.json**:
```json
{
  "scripts": {
    "setup:env": "node scripts/setup-env.js",
    "setup:check": "node scripts/check-env.js",
    "dev": "npm run setup:check && next dev",
    "build": "npm run setup:check && next build"
  }
}
```

### Phase 3: Developer Experience Enhancement

#### Step 3.1: Interactive Setup Wizard

**File**: `scripts/setup-wizard.js`
```javascript
import inquirer from 'inquirer';
import { EnvGenerator } from './env-generator.js';

export class SetupWizard {
  async run() {
    console.log('🧙‍♂️ CDP Environment Setup Wizard\n');

    // Check for existing credentials
    const hasCredentials = await this.checkCredentials();
    
    if (!hasCredentials) {
      await this.guidedCredentialSetup();
    }

    // Configure environment options
    await this.configureEnvironment();

    // Generate and verify
    await this.finalizeSetup();
  }

  async checkCredentials() {
    // Implementation for credential checking
  }

  async guidedCredentialSetup() {
    // Interactive guide for obtaining CDP credentials
  }

  async configureEnvironment() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'network',
        message: 'Which network would you like to use?',
        choices: [
          { name: 'Base Sepolia (Testnet) - Recommended for development', value: 'base-sepolia' },
          { name: 'Base Mainnet (Production) - Real money!', value: 'base' }
        ],
        default: 'base-sepolia'
      },
      {
        type: 'confirm',
        name: 'includeAiGateway',
        message: 'Do you want to configure Vercel AI Gateway?',
        default: false
      }
    ]);

    this.config = answers;
  }
}
```

#### Step 3.2: Environment Verification Tool

**File**: `scripts/check-env.js`
```javascript
#!/usr/bin/env node
import fs from 'fs';
import { EnvGenerator } from './env-generator.js';

async function checkEnvironment() {
  const generator = new EnvGenerator();
  
  // Silent check - if credentials exist but no .env.local, auto-generate
  try {
    await generator.parser.validateCredentials();
    
    if (!fs.existsSync(generator.envPath)) {
      console.log('🔧 Auto-generating .env.local from credential files...');
      await generator.generateEnvLocal();
      console.log('✅ Environment ready\n');
    }
    
    // Validate existing environment
    generator.validateEnvFile();
    
  } catch (error) {
    console.error('❌ Environment check failed:', error.message);
    console.error('💡 Run: npm run setup:env');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkEnvironment();
}
```

### Phase 4: Advanced Features

#### Step 4.1: Multi-Environment Support

**Configuration structure**:
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

#### Step 4.2: Credential Rotation Automation

**File**: `scripts/rotate-credentials.js`
- Automated backup of current credentials
- Safe credential replacement
- Verification of new credentials
- Rollback capability

#### Step 4.3: CI/CD Integration

**GitHub Actions workflow**:
```yaml
name: Environment Setup
on: [push, pull_request]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup CDP Credentials
        env:
          CDP_API_KEY_ID: ${{ secrets.CDP_API_KEY_ID }}
          CDP_API_KEY_SECRET: ${{ secrets.CDP_API_KEY_SECRET }}
          CDP_WALLET_SECRET: ${{ secrets.CDP_WALLET_SECRET }}
        run: |
          echo '{"id":"$CDP_API_KEY_ID","privateKey":"$CDP_API_KEY_SECRET"}' > cdp_api_key.json
          echo "$CDP_WALLET_SECRET" > cdp_wallet_secret.txt
          npm run setup:env
```

## Implementation Timeline

### Week 1: Foundation
- [x] **Day 1**: Security hardening (completed)
- [ ] **Day 2-3**: Credential parser implementation
- [ ] **Day 4-5**: Environment generator implementation

### Week 2: Automation
- [ ] **Day 1-2**: Setup script creation
- [ ] **Day 3-4**: Package.json integration and testing
- [ ] **Day 5**: Error handling and validation

### Week 3: Enhancement
- [ ] **Day 1-2**: Interactive setup wizard
- [ ] **Day 3-4**: Environment verification tools
- [ ] **Day 5**: Documentation updates

### Week 4: Advanced Features
- [ ] **Day 1-2**: Multi-environment support
- [ ] **Day 3-4**: CI/CD integration
- [ ] **Day 5**: Final testing and deployment

## Risk Mitigation

### Backup Strategy
- Always backup existing `.env.local` before overwriting
- Store backup with timestamp for recovery
- Provide rollback command: `npm run setup:rollback`

### Error Handling
- Graceful degradation to manual setup if automation fails
- Clear error messages with troubleshooting steps
- Validation at every step of the process

### Security Considerations
- Never log sensitive credential values
- Secure file permissions on credential files
- Warning messages about credential protection
- Automated gitignore verification

## Success Metrics

### Developer Experience
- Setup time reduced from 10+ minutes to < 2 minutes
- Zero manual credential entry errors
- 100% success rate for new developer onboarding

### Security
- Zero accidental credential commits
- Automated security validation
- Centralized credential management

### Reliability
- 99% automation success rate
- Comprehensive error handling
- Easy rollback and recovery

## Rollback Plan

If automation fails, the system falls back to:
1. Manual `.env.local` creation (current process)
2. Existing documentation remains valid
3. No disruption to existing workflows
4. Clear instructions for manual setup

The migration maintains full backward compatibility while adding the new automated capabilities.

---

**Status**: Ready for Phase 2 Implementation
**Next Action**: Begin credential parser development
