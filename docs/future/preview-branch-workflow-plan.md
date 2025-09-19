# Preview Branch → Main Deployment Workflow Plan

**Date**: September 19, 2025  
**Status**: 🔄 **WORKFLOW DESIGN** - Complete preview-to-main deployment strategy  
**Priority**: 🟡 **MEDIUM** - Improve development workflow and deployment safety  

## 🎯 Objective

Establish a robust preview branch workflow that ensures all changes are tested on preview deployments before merging to main, preventing production deployment failures and enabling safe feature development.

## 📊 Current Situation Analysis

### ✅ What's Working
- **Preview deployments**: Preview branches successfully deploy to Vercel
- **Environment variables**: All required variables are now properly configured
- **Build process**: Clean builds complete successfully in 7.4s
- **Core functionality**: Wallet creation, funding, and AI features working

### ❌ Current Issues
- **Main branch deployment**: Main branch appears to have deployment issues while preview branches work
- **No formal workflow**: Missing standardized process for preview → main progression
- **Risk of production issues**: Changes may go to main without proper preview testing
- **Manual process**: No automated validation before merge

## 🏗️ Proposed Workflow Architecture

### **Phase 1: Branch Strategy**

```
main branch (production)
├── develop branch (integration)
│   ├── feature/environment-fix
│   ├── feature/wallet-enhancement
│   └── feature/documentation-cleanup
└── hotfix/critical-bug-fix
```

#### Branch Types and Purposes

| Branch Type | Purpose | Deployment Target | Merge Process |
|-------------|---------|-------------------|---------------|
| `main` | Production-ready code | Production (auto) | From `develop` only |
| `develop` | Integration branch | Preview (auto) | From feature branches |
| `feature/*` | New features/fixes | Preview (auto) | To `develop` via PR |
| `hotfix/*` | Critical production fixes | Preview → Production | Direct to `main` |

### **Phase 2: Preview Branch Workflow**

#### 2.1 Feature Development Process

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/wallet-usdc-enhancement

# 2. Develop and test locally
npm run dev
npm run build  # Ensure clean build
npm run validate-env

# 3. Push feature branch (triggers preview deployment)
git push origin feature/wallet-usdc-enhancement

# 4. Test on preview deployment
# Preview URL: https://x402-ai-starter-feature-wallet-usdc-enhancement.vercel.app

# 5. Create PR to develop branch
# 6. Review and merge to develop
# 7. Test on develop preview deployment
# 8. Merge develop to main for production
```

#### 2.2 Automated Preview Deployment

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "env": {
    "NETWORK": "base-sepolia"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

**Environment Variable Strategy**:
- **Preview branches**: Use testnet configuration (`NETWORK=base-sepolia`)
- **Main branch**: Use production configuration (`NETWORK=base`)
- **Shared variables**: CDP credentials, AI Gateway key consistent across environments

### **Phase 3: Automated Quality Gates**

#### 3.1 Pre-merge Validation

```bash
# Automated checks before merge (GitHub Actions or Vercel)
npm run validate-env      # Environment variable validation
npm run typecheck        # TypeScript compilation check
npm run build            # Full build verification
npm run test             # Unit tests (if implemented)
curl -f $PREVIEW_URL     # Health check on preview deployment
```

#### 3.2 GitHub Actions Workflow

**.github/workflows/preview-validation.yml**:
```yaml
name: Preview Branch Validation
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [feature/*, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate environment
        run: npm run validate-env
        env:
          CDP_API_KEY_ID: ${{ secrets.CDP_API_KEY_ID }}
          CDP_API_KEY_SECRET: ${{ secrets.CDP_API_KEY_SECRET }}
          CDP_WALLET_SECRET: ${{ secrets.CDP_WALLET_SECRET }}
          VERCEL_AI_GATEWAY_KEY: ${{ secrets.VERCEL_AI_GATEWAY_KEY }}
      
      - name: Type check
        run: npm run typecheck
      
      - name: Build
        run: npm run build
      
      - name: Health check (if preview deployed)
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            # Wait for Vercel deployment, then test
            sleep 60
            PREVIEW_URL=$(gh pr view ${{ github.event.number }} --json url --jq '.url' | sed 's/github.com/vercel.app/')
            curl -f "$PREVIEW_URL" || exit 1
          fi
```

### **Phase 4: Environment Configuration Management**

#### 4.1 Environment Variable Hierarchy

```bash
# Development (.env.local)
NETWORK=base-sepolia
CDP_API_KEY_ID=dev_key_123
CDP_API_KEY_SECRET=dev_secret_456
CDP_WALLET_SECRET=dev_wallet_789
VERCEL_AI_GATEWAY_KEY=dev_ai_key_abc

# Preview Branches (Vercel Environment Variables)
NETWORK=base-sepolia  # Always testnet for safety
CDP_API_KEY_ID=staging_key_123
CDP_API_KEY_SECRET=staging_secret_456  
CDP_WALLET_SECRET=staging_wallet_789
VERCEL_AI_GATEWAY_KEY=staging_ai_key_abc

# Production (Main Branch - Vercel Environment Variables)
NETWORK=base  # Mainnet for production
CDP_API_KEY_ID=prod_key_123
CDP_API_KEY_SECRET=prod_secret_456
CDP_WALLET_SECRET=prod_wallet_789
VERCEL_AI_GATEWAY_KEY=prod_ai_key_abc
```

#### 4.2 Environment Variable Management Script

```bash
#!/bin/bash
# scripts/setup-preview-env.sh

BRANCH_NAME=$(git branch --show-current)
PREVIEW_SUFFIX=$(echo $BRANCH_NAME | sed 's/[^a-zA-Z0-9]/-/g')

echo "Setting up preview environment for branch: $BRANCH_NAME"

# Set preview-specific variables
vercel env add NETWORK base-sepolia --env preview
vercel env add CDP_API_KEY_ID $PREVIEW_CDP_API_KEY_ID --env preview
vercel env add CDP_API_KEY_SECRET $PREVIEW_CDP_API_KEY_SECRET --env preview
vercel env add CDP_WALLET_SECRET $PREVIEW_CDP_WALLET_SECRET --env preview
vercel env add VERCEL_AI_GATEWAY_KEY $PREVIEW_VERCEL_AI_GATEWAY_KEY --env preview

echo "Preview environment configured for: $BRANCH_NAME"
echo "Preview URL will be: https://x402-ai-starter-$PREVIEW_SUFFIX.vercel.app"
```

## 🔧 Implementation Plan

### **Week 1: Foundation Setup**

#### Day 1-2: Branch Strategy
- [ ] Create `develop` branch from current `main`
- [ ] Update branch protection rules on GitHub
- [ ] Configure Vercel for multi-branch deployment
- [ ] Document branch naming conventions

#### Day 3-4: Environment Configuration  
- [ ] Set up preview environment variables in Vercel
- [ ] Create environment management scripts
- [ ] Test preview deployments with testnet configuration
- [ ] Validate environment isolation

#### Day 5: Documentation and Training
- [ ] Create developer workflow documentation
- [ ] Update README with new workflow
- [ ] Train team on new process
- [ ] Create troubleshooting guide

### **Week 2: Automation and Quality Gates**

#### Day 1-3: CI/CD Pipeline
- [ ] Implement GitHub Actions workflow
- [ ] Add automated build and test validation
- [ ] Configure preview deployment health checks
- [ ] Set up deployment notifications

#### Day 4-5: Testing and Refinement
- [ ] Test complete workflow with sample feature
- [ ] Validate environment variable isolation
- [ ] Test hotfix deployment process
- [ ] Performance test preview deployments

## 🧪 Testing Strategy

### **Feature Development Testing**

```bash
# 1. Local development testing
npm run dev                           # Development server
npm run build                        # Local build test
npm run validate-env                 # Environment validation

# 2. Preview deployment testing  
git push origin feature/my-feature   # Triggers preview deployment
curl -f https://preview-url.vercel.app # Health check
# Test wallet creation, funding, AI chat

# 3. Integration testing on develop
# Merge feature to develop
# Test on develop preview deployment
# Validate no regressions with other features

# 4. Production deployment
# Merge develop to main
# Monitor production deployment
# Validate all functionality in production
```

### **Deployment Validation Checklist**

#### Preview Deployment Validation
- [ ] Environment variables properly configured
- [ ] Build completes successfully  
- [ ] Homepage loads without errors
- [ ] Wallet creation works
- [ ] Funding functionality operational
- [ ] AI chat interface responsive
- [ ] No console errors or warnings
- [ ] Performance acceptable (<3s load time)

#### Production Deployment Validation  
- [ ] All preview validations pass
- [ ] Production environment variables set
- [ ] Mainnet configuration (if applicable)
- [ ] SSL certificate valid
- [ ] Custom domain (if configured) working
- [ ] Monitoring and alerting active
- [ ] Backup and rollback plan ready

## 🔒 Security and Safety Measures

### **Environment Isolation**
- **Testnet Only for Previews**: All preview branches use `base-sepolia` testnet
- **Separate Credentials**: Different CDP credentials for preview vs production
- **No Real Money**: Preview deployments never handle real USDC/ETH
- **Access Control**: Preview URLs are public but functionality is testnet-limited

### **Production Safety**
- **Manual Approval**: Production deployments require manual approval
- **Staged Rollout**: Deploy to preview first, then production
- **Rollback Plan**: Automated rollback for critical failures
- **Monitoring**: Real-time alerting for production issues

## 📊 Success Metrics

### **Development Workflow Metrics**
- **Deployment Success Rate**: >95% for preview branches
- **Time to Deploy**: <5 minutes for preview deployments
- **Bug Detection**: Catch >90% of issues in preview before production
- **Developer Satisfaction**: Streamlined workflow with clear process

### **Quality Metrics**
- **Production Incidents**: <1 per month due to deployment issues
- **Rollback Frequency**: <5% of production deployments
- **Environment Consistency**: 100% configuration parity between preview/production
- **Documentation Currency**: 100% of workflow documented and up-to-date

## 🚀 Expected Benefits

### **For Developers**
- **Confidence**: Test changes thoroughly before production
- **Speed**: Rapid iteration with automatic preview deployments  
- **Safety**: No fear of breaking production with experimental features
- **Collaboration**: Clear process for code review and integration

### **For Operations**
- **Reliability**: Fewer production incidents due to better testing
- **Visibility**: Clear deployment pipeline with automated validation
- **Control**: Ability to rollback quickly if issues arise
- **Monitoring**: Comprehensive tracking of deployment health

### **For Business**
- **Faster Features**: Streamlined development → faster time to market
- **Higher Quality**: Better testing → fewer user-facing bugs
- **Lower Risk**: Staged deployments → reduced business impact of issues
- **Better Planning**: Predictable deployment schedule and process

## 🔮 Future Enhancements

### **Phase 2: Advanced Features**
- **A/B Testing**: Deploy multiple previews for feature comparison
- **Performance Testing**: Automated load testing on preview deployments
- **Security Scanning**: Automated vulnerability scanning in CI/CD
- **Visual Regression**: Screenshot comparison for UI changes

### **Phase 3: Integration**
- **Slack Integration**: Deployment notifications and status updates  
- **JIRA Integration**: Automatic ticket updates on deployment
- **Analytics**: Track feature usage across preview vs production
- **Cost Monitoring**: Monitor Vercel usage and optimize resources

---

## 🎯 Immediate Next Steps

1. **Fix main branch deployment** - Ensure main branch can deploy successfully
2. **Create develop branch** - Set up integration branch for feature merging
3. **Configure preview environments** - Set up proper environment variable isolation
4. **Document workflow** - Create clear instructions for developers
5. **Test with sample feature** - Validate entire workflow end-to-end

**Timeline**: 1-2 weeks for full implementation  
**Priority**: Medium - improves workflow but not blocking current development  
**Dependencies**: Ensure main branch deployment is working first
