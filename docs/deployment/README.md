# Deployment Best Practices

This document outlines best practices for preventing deployment issues, particularly those related to dependency management and build failures.

## AI SDK Dependency Management

### Understanding AI SDK v5 Architecture

AI SDK v5 introduced a modular architecture where provider-specific functions are separated into individual packages:

- **Core package**: `ai` - Contains core functionality like `streamText`, `generateText`, `tool`, etc.
- **Provider packages**: `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`, etc.

### Correct Import Patterns

#### ✅ Correct Usage
```typescript
// Core AI SDK imports
import { streamText, generateText, tool } from "ai";

// Provider-specific imports
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
```

#### ❌ Incorrect Usage (Will Cause Build Failures)
```typescript
// This will fail in AI SDK v5+
import { streamText, openai, google } from "ai";
```

## Pre-Deployment Validation

### 1. Local Build Testing

Always test your build locally before deploying:

```bash
# Test the production build
pnpm run build

# Verify the build starts correctly
pnpm start
```

### 2. Dependency Audit

Before adding or updating dependencies:

```bash
# Check what's exported from a package
node -e "console.log(Object.keys(require('package-name')))"

# Verify package documentation
pnpm info package-name
```

### 3. TypeScript Validation

Enable strict type checking to catch import errors early:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Continuous Integration Best Practices

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9.15.4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm run typecheck
      
      - name: Build
        run: pnpm run build
```

### Vercel Integration

1. **Enable Build Checks**: Configure Vercel to require successful builds before deployment
2. **Use Preview Deployments**: Test changes in preview environments first
3. **Monitor Build Logs**: Set up alerts for build failures

## Dependency Management Strategies

### 1. Lock File Management

- **Always commit** `pnpm-lock.yaml` to version control
- **Use `--frozen-lockfile`** in production environments
- **Regularly update** dependencies in controlled batches

### 2. Package Version Strategy

```json
// package.json - Be specific with major versions
{
  "dependencies": {
    "ai": "^5.0.0",                    // Pin major version
    "@ai-sdk/openai": "^2.0.0",       // Pin major version
    "@ai-sdk/google": "^2.0.0"        // Pin major version
  }
}
```

### 3. Breaking Change Monitoring

- **Subscribe** to package release notes
- **Test updates** in staging environment first
- **Read migration guides** for major version updates

## Common Pitfalls and Solutions

### 1. Import/Export Mismatches

**Problem**: Package exports change between versions
**Solution**: Always verify exports in package documentation

### 2. Environment Differences

**Problem**: Different behavior between local and production
**Solution**: Use exact Node.js versions and environment variables

### 3. Case Sensitivity

**Problem**: File imports work locally (macOS/Windows) but fail on Linux (Vercel)
**Solution**: Always use exact case for file names and imports

## Monitoring and Alerting

### Build Failure Notifications

Set up Slack/email notifications for:
- Failed deployments
- Build errors
- Dependency security alerts

### Health Checks

Implement health check endpoints:

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local'
  });
}
```

## Emergency Response

### Quick Rollback Procedure

1. **Vercel Dashboard**: Use instant rollback to previous deployment
2. **Git Revert**: Revert problematic commits
3. **Hotfix Branch**: Create emergency fix branch

### Debugging Failed Deployments

1. **Check Build Logs**: Look for specific error messages
2. **Compare Environments**: Verify local vs. production differences
3. **Dependency Diff**: Compare package versions between working and failing builds

## Documentation Maintenance

- **Update this guide** when encountering new issues
- **Document workarounds** for third-party package issues
- **Keep examples current** with latest package versions
- **Review quarterly** for outdated information

## Resources

- [Vercel Build Troubleshooting](https://vercel.com/docs/deployments/troubleshoot-a-build)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [pnpm Documentation](https://pnpm.io/motivation)
- [Next.js Deployment](https://nextjs.org/docs/deployment)