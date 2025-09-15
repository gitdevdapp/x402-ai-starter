# Troubleshooting Guide

Common issues and solutions for x402 deployment and operation.

## Environment Issues

### Missing Environment Variables
```
Error: Missing required environment variables
```

**Solutions:**
1. Check `.env.local` exists with all required variables
2. Verify variable names match exactly (case-sensitive)
3. Restart development server after changes
4. For production, check deployment platform environment variables

### Invalid CDP Credentials
```
Error: Unauthorized / Invalid API key
```

**Solutions:**
1. Verify credentials in [CDP Portal](https://portal.cdp.coinbase.com)
2. Check API key status (not revoked)
3. Regenerate credentials if necessary
4. Ensure wallet secret format is correct

### Network Configuration
```
Error: Invalid network / Network not supported
```

**Solutions:**
1. Set `NETWORK=base-sepolia` for testnet
2. Set `NETWORK=base` for mainnet
3. Check for typos in network name
4. Ensure network value is exactly one of the supported options

## Wallet Issues

### Account Creation Failures
```
Error: Failed to create account
```

**Solutions:**
1. Verify CDP credentials are valid
2. Check network connectivity
3. Ensure sufficient API rate limits
4. Try creating account with unique names

### Insufficient Funds
```
Error: Insufficient funds for transaction
```

**Solutions:**
1. **Testnet**: Automatic funding should work, check logs
2. **Mainnet**: Manually fund accounts with real USDC/ETH
3. Check account balances in CDP dashboard
4. Request testnet funds from faucet manually if auto-funding fails

### Transaction Failures
```
Error: Transaction reverted / Transaction failed
```

**Solutions:**
1. Ensure sufficient ETH for gas fees
2. Check recipient address format
3. Verify contract addresses for token transfers
4. Monitor network congestion

## Network and Connectivity

### Slow Transactions
```
Transaction pending for long time
```

**Solutions:**
1. Check network status at [Base Status](https://status.base.org)
2. Increase transaction timeout
3. Monitor transaction on block explorer
4. Consider network congestion

### RPC Connection Issues
```
Error: Cannot connect to RPC endpoint
```

**Solutions:**
1. Check internet connectivity
2. Verify network configuration
3. Try alternative RPC endpoints
4. Check for firewall blocking

## Development Issues

### Development Server Problems
```
Error: Cannot start development server
```

**Solutions:**
1. Check port 3000 availability: `lsof -ti:3000`
2. Kill existing processes: `kill -9 $(lsof -ti:3000)`
3. Clear Next.js cache: `rm -rf .next`
4. Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Build Failures
```
Error: Build failed
```

**Solutions:**
1. Check TypeScript errors: `pnpm type-check`
2. Verify all environment variables in build environment
3. Check for missing dependencies
4. Clear build cache and retry

### AI Features Not Working
```
Error: VERCEL_AI_GATEWAY_KEY required
```

**Solutions:**
1. Set `VERCEL_AI_GATEWAY_KEY` in environment
2. Get key from Vercel AI dashboard
3. Disable AI features if not needed
4. Check AI gateway service status

## Production Issues

### Deployment Failures

**Vercel Deployment Issues:**
1. Check environment variables in Vercel dashboard
2. Verify build logs for errors
3. Ensure all dependencies are in package.json
4. Check function timeout limits

**General Deployment Issues:**
1. Verify production environment variables
2. Check deployment platform logs
3. Ensure production credentials are different from development
4. Monitor resource usage and limits

### Performance Issues

**Slow Response Times:**
1. Check CDP API rate limits
2. Monitor database/wallet connection pools
3. Verify network latency to Base network
4. Check for memory leaks

**High Error Rates:**
1. Monitor error logs for patterns
2. Check credential validity and rate limits
3. Verify network stability
4. Monitor third-party service status

## Security Issues

### Credential Exposure
```
Warning: Credentials detected in logs/git
```

**Solutions:**
1. Check `.gitignore` includes all sensitive files
2. Remove credentials from git history if committed
3. Rotate exposed credentials immediately
4. Review logging to prevent credential exposure

### Suspicious Activity
```
Alert: Unusual account activity detected
```

**Solutions:**
1. Review account transaction history
2. Check for unauthorized access
3. Rotate credentials as precaution
4. Monitor account activity closely

## Debugging Tools

### Environment Validation
```bash
# Check environment loading
node -e "
try {
  const { env } = require('./src/lib/env.js');
  console.log('✅ Environment loaded successfully');
  console.log('Network:', env.NETWORK);
} catch (error) {
  console.error('❌ Environment error:', error.message);
}
"
```

### CDP Connection Test
```bash
# Test CDP credentials
node -e "
const { CdpClient } = require('@coinbase/cdp-sdk');
new CdpClient().evm.createAccount()
  .then(acc => console.log('✅ CDP working:', acc.address))
  .catch(err => console.error('❌ CDP error:', err.message));
"
```

### Network Connectivity
```bash
# Test network connectivity
curl -s https://mainnet.base.org/ | head -1
curl -s https://sepolia.base.org/ | head -1
```

### Account Balance Check
```javascript
// Check account balances
import { getOrCreatePurchaserAccount } from './src/lib/accounts.js';

const account = await getOrCreatePurchaserAccount();
const balances = await account.listTokenBalances({
  network: process.env.NETWORK
});

console.log('Account:', account.address);
balances.balances.forEach(balance => {
  console.log(`${balance.token.symbol}: ${balance.amount}`);
});
```

## Getting Help

### Log Analysis
1. Check application logs for error patterns
2. Monitor CDP API response codes
3. Review network transaction logs
4. Check deployment platform logs

### Support Resources
- [CDP Documentation](https://docs.cdp.coinbase.com)
- [CDP Community Discord](https://discord.gg/coinbasedev)
- [Base Documentation](https://docs.base.org)
- [Vercel Support](https://vercel.com/support)

### Monitoring Setup
```javascript
// Basic error monitoring
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

## Emergency Procedures

### Credential Compromise
1. **Immediate**: Revoke compromised credentials in CDP Portal
2. **Generate**: New credentials with different names
3. **Update**: All deployment environments
4. **Monitor**: Account activity for unusual transactions
5. **Audit**: Check for any unauthorized changes

### Service Outage
1. **Check**: Service status pages (CDP, Base, Vercel)
2. **Monitor**: Error rates and response times
3. **Fallback**: Use backup RPC endpoints if available
4. **Communicate**: With users about service status
5. **Document**: Incident for post-mortem analysis
