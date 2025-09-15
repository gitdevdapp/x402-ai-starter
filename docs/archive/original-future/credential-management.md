# Advanced Credential Management Guide

## Overview

This guide covers advanced strategies for managing CDP credentials across different environments, team scenarios, and operational requirements. It builds on the automated setup to provide enterprise-grade credential management capabilities.

## 🏗 Credential Architecture

### Multi-Environment Strategy

**Environment Hierarchy:**
```
credentials/
├── shared/                    # Shared configuration
│   ├── base-config.json      # Base network settings
│   └── templates/            # Environment templates
├── development/              # Local development
│   ├── cdp_api_key.json     # Dev CDP credentials
│   ├── cdp_wallet_secret.txt # Dev wallet secret
│   └── overrides.json       # Dev-specific overrides
├── staging/                 # Staging environment
│   ├── cdp_api_key.json     # Staging CDP credentials
│   ├── cdp_wallet_secret.txt # Staging wallet secret
│   └── config.json          # Staging configuration
├── production/              # Production environment
│   ├── cdp_api_key.json     # Production CDP credentials
│   ├── cdp_wallet_secret.txt # Production wallet secret
│   └── config.json          # Production configuration
└── backup/                  # Encrypted backups
    ├── 2024-01-15/          # Daily backups
    └── rotation-history/    # Rotation audit trail
```

### Credential Separation Model

**Development Credentials:**
- Limited testnet access only
- Restricted API permissions
- Short-lived tokens where possible
- Automated funding for testing

**Staging Credentials:**
- Production-like environment
- Real network access with limits
- Extended monitoring
- Controlled fund allocation

**Production Credentials:**
- Full mainnet access
- Complete API permissions
- Maximum security measures
- Real financial responsibility

## 🔑 Credential Lifecycle Management

### 1. Credential Provisioning

**Automated Provisioning Process:**
```javascript
export class CredentialProvisioner {
  async provisionEnvironment(environment) {
    console.log(`🔧 Provisioning credentials for ${environment}...`);
    
    // Generate environment-specific credentials
    const credentials = await this.generateCredentials(environment);
    
    // Configure permissions and limits
    await this.configurePermissions(credentials, environment);
    
    // Store securely
    await this.storeCredentials(credentials, environment);
    
    // Validate setup
    await this.validateEnvironmentSetup(environment);
    
    return credentials;
  }

  async generateCredentials(environment) {
    const config = this.getEnvironmentConfig(environment);
    
    // Create CDP API key with appropriate permissions
    const apiKey = await this.createCDPApiKey({
      name: `${config.project}-${environment}`,
      permissions: config.permissions,
      restrictions: config.restrictions
    });

    // Generate wallet secret for environment
    const walletSecret = await this.generateWalletSecret({
      network: config.network,
      backup: config.enableBackup
    });

    return { apiKey, walletSecret };
  }

  getEnvironmentConfig(environment) {
    const configs = {
      development: {
        network: 'base-sepolia',
        permissions: ['read', 'write_testnet'],
        restrictions: ['testnet_only'],
        enableBackup: false,
        autoFunding: true
      },
      staging: {
        network: 'base-sepolia',
        permissions: ['read', 'write_testnet', 'admin_testnet'],
        restrictions: ['testnet_only', 'rate_limited'],
        enableBackup: true,
        autoFunding: false
      },
      production: {
        network: 'base',
        permissions: ['read', 'write', 'admin'],
        restrictions: ['rate_limited', 'monitored'],
        enableBackup: true,
        autoFunding: false
      }
    };

    return configs[environment];
  }
}
```

### 2. Credential Rotation Strategy

**Scheduled Rotation:**
```javascript
export class CredentialRotationManager {
  constructor() {
    this.rotationSchedule = {
      development: '90d',    // 90 days
      staging: '60d',       // 60 days  
      production: '30d'     // 30 days
    };
  }

  async scheduleRotation(environment) {
    const schedule = this.rotationSchedule[environment];
    const nextRotation = this.calculateNextRotation(schedule);
    
    console.log(`📅 Next ${environment} rotation: ${nextRotation}`);
    
    // Schedule automated rotation
    await this.scheduleJob(environment, nextRotation);
  }

  async performRotation(environment) {
    console.log(`🔄 Starting credential rotation for ${environment}...`);
    
    try {
      // Phase 1: Prepare new credentials
      const newCredentials = await this.generateNewCredentials(environment);
      
      // Phase 2: Validate new credentials
      await this.validateNewCredentials(newCredentials, environment);
      
      // Phase 3: Backup current credentials
      await this.backupCurrentCredentials(environment);
      
      // Phase 4: Deploy new credentials
      await this.deployNewCredentials(newCredentials, environment);
      
      // Phase 5: Verify rotation success
      await this.verifyRotationSuccess(environment);
      
      // Phase 6: Cleanup old credentials
      await this.cleanupOldCredentials(environment);
      
      console.log(`✅ Credential rotation completed for ${environment}`);
      
    } catch (error) {
      console.error(`❌ Rotation failed for ${environment}:`, error);
      await this.rollbackRotation(environment);
      throw error;
    }
  }

  async generateNewCredentials(environment) {
    const provisioner = new CredentialProvisioner();
    return await provisioner.provisionEnvironment(environment);
  }

  async rollbackRotation(environment) {
    console.log(`⏪ Rolling back credential rotation for ${environment}...`);
    
    // Restore from backup
    await this.restoreFromBackup(environment);
    
    // Verify rollback success
    await this.verifyRollbackSuccess(environment);
    
    console.log(`✅ Rollback completed for ${environment}`);
  }
}
```

### 3. Credential Validation and Testing

**Comprehensive Validation:**
```javascript
export class CredentialValidator {
  async validateCredentials(credentials, environment) {
    const validations = [
      this.validateFormat(credentials),
      this.validatePermissions(credentials, environment),
      this.validateConnectivity(credentials),
      this.validateLimits(credentials, environment),
      this.validateSecurity(credentials)
    ];

    const results = await Promise.all(validations);
    return this.compileValidationReport(results);
  }

  async validateConnectivity(credentials) {
    try {
      // Test CDP API connection
      const cdp = new CdpClient(credentials.apiKey);
      const testAccount = await cdp.evm.createAccount();
      
      // Test wallet functionality
      const balances = await testAccount.listTokenBalances({
        network: credentials.network
      });

      return {
        passed: true,
        tests: {
          apiConnection: true,
          accountCreation: true,
          balanceQuery: true
        },
        testAccount: testAccount.address
      };
      
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        tests: {
          apiConnection: false,
          accountCreation: false,
          balanceQuery: false
        }
      };
    }
  }

  async validatePermissions(credentials, environment) {
    const requiredPermissions = this.getRequiredPermissions(environment);
    const actualPermissions = await this.getCredentialPermissions(credentials);
    
    const missingPermissions = requiredPermissions.filter(
      perm => !actualPermissions.includes(perm)
    );

    return {
      passed: missingPermissions.length === 0,
      required: requiredPermissions,
      actual: actualPermissions,
      missing: missingPermissions
    };
  }
}
```

## 🏢 Team Credential Management

### 1. Multi-Developer Setup

**Individual Developer Credentials:**
```javascript
export class TeamCredentialManager {
  async setupDeveloperCredentials(developerId) {
    console.log(`👤 Setting up credentials for developer: ${developerId}`);
    
    // Create developer-specific credentials
    const devCredentials = await this.createDeveloperCredentials(developerId);
    
    // Set up isolated environment
    await this.setupIsolatedEnvironment(developerId, devCredentials);
    
    // Configure access controls
    await this.configureAccessControls(developerId);
    
    return devCredentials;
  }

  async createDeveloperCredentials(developerId) {
    return {
      apiKey: await this.createLimitedApiKey(developerId),
      walletSecret: await this.createTestWallet(developerId),
      environment: 'development',
      restrictions: [
        'testnet_only',
        'limited_funds',
        'rate_limited',
        `owner:${developerId}`
      ]
    };
  }

  async setupIsolatedEnvironment(developerId, credentials) {
    const envDir = `environments/dev-${developerId}`;
    await fs.mkdir(envDir, { recursive: true });
    
    // Create developer-specific credential files
    await this.writeCredentialFiles(envDir, credentials);
    
    // Generate developer-specific .env template
    await this.generateDeveloperEnv(envDir, developerId);
  }
}
```

### 2. Shared Resource Management

**Shared Development Resources:**
```javascript
export class SharedResourceManager {
  async setupSharedResources() {
    return {
      sharedTestnetFunds: await this.setupSharedFundingPool(),
      sharedTestAccounts: await this.createSharedTestAccounts(),
      sharedInfrastructure: await this.setupSharedInfrastructure()
    };
  }

  async setupSharedFundingPool() {
    // Create a shared funding account for team testing
    const fundingAccount = await this.createAccount('shared-funding');
    
    // Fund it with substantial testnet USDC
    await this.requestLargeFaucetAllocation(fundingAccount);
    
    // Set up automated distribution to developer accounts
    await this.setupAutoDistribution(fundingAccount);
    
    return fundingAccount;
  }

  async distributeTestFunds(recipients) {
    const fundingAccount = await this.getSharedFundingAccount();
    
    for (const recipient of recipients) {
      await this.transferTestFunds(fundingAccount, recipient, '100.00'); // $100 USDC
    }
  }
}
```

### 3. Access Control and Permissions

**Role-Based Access Control:**
```javascript
export class AccessControlManager {
  constructor() {
    this.roles = {
      developer: {
        permissions: ['read', 'testnet_write'],
        environments: ['development'],
        restrictions: ['testnet_only', 'limited_funds']
      },
      tester: {
        permissions: ['read', 'testnet_write', 'testnet_admin'],
        environments: ['development', 'staging'],
        restrictions: ['testnet_only']
      },
      devops: {
        permissions: ['read', 'write', 'admin'],
        environments: ['development', 'staging', 'production'],
        restrictions: ['audited', 'monitored']
      },
      admin: {
        permissions: ['all'],
        environments: ['all'],
        restrictions: ['audited', 'monitored', 'mfa_required']
      }
    };
  }

  async assignRole(userId, role, environment) {
    console.log(`👑 Assigning ${role} role to ${userId} for ${environment}`);
    
    const roleConfig = this.roles[role];
    if (!roleConfig) {
      throw new Error(`Unknown role: ${role}`);
    }

    // Validate environment access
    if (!this.canAccessEnvironment(roleConfig, environment)) {
      throw new Error(`Role ${role} cannot access ${environment}`);
    }

    // Create role-specific credentials
    const credentials = await this.createRoleCredentials(userId, roleConfig, environment);
    
    // Apply restrictions
    await this.applyRestrictions(credentials, roleConfig.restrictions);
    
    return credentials;
  }

  canAccessEnvironment(roleConfig, environment) {
    return roleConfig.environments.includes(environment) || 
           roleConfig.environments.includes('all');
  }
}
```

## 🔒 Security and Compliance

### 1. Audit Trail and Logging

**Comprehensive Audit System:**
```javascript
export class CredentialAuditor {
  async startAuditLogging() {
    this.auditLogger = new SecureAuditLogger({
      logLevel: 'INFO',
      encryption: true,
      retention: '7y', // 7 years for compliance
      immutable: true
    });

    // Log all credential operations
    this.setupAuditHooks();
  }

  async logCredentialOperation(operation, details) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      operation,
      user: this.getCurrentUser(),
      environment: details.environment,
      resource: this.sanitizeResourceInfo(details.resource),
      success: details.success,
      errorCode: details.errorCode,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      sessionId: this.getSessionId()
    };

    await this.auditLogger.log(auditEntry);
  }

  async generateComplianceReport(startDate, endDate) {
    const auditRecords = await this.auditLogger.query({
      startDate,
      endDate,
      includeMetrics: true
    });

    return {
      summary: this.generateSummary(auditRecords),
      credentialOperations: this.analyzeCredentialOps(auditRecords),
      securityEvents: this.identifySecurityEvents(auditRecords),
      complianceStatus: this.assessCompliance(auditRecords),
      recommendations: this.generateRecommendations(auditRecords)
    };
  }
}
```

### 2. Compliance Framework

**Regulatory Compliance:**
```javascript
export class ComplianceManager {
  constructor() {
    this.standards = {
      SOX: new SOXCompliance(),
      PCI_DSS: new PCIDSSCompliance(),
      ISO27001: new ISO27001Compliance(),
      SOC2: new SOC2Compliance()
    };
  }

  async ensureCompliance(standard) {
    const compliance = this.standards[standard];
    if (!compliance) {
      throw new Error(`Unknown compliance standard: ${standard}`);
    }

    console.log(`📋 Ensuring ${standard} compliance...`);

    const checks = await compliance.performChecks({
      credentialManagement: this.getCredentialPolicies(),
      accessControls: this.getAccessControlPolicies(),
      auditTrail: this.getAuditPolicies(),
      dataProtection: this.getDataProtectionPolicies()
    });

    const report = compliance.generateReport(checks);
    
    if (!report.compliant) {
      throw new ComplianceError(`${standard} compliance failed`, report.violations);
    }

    return report;
  }
}
```

## 🚀 Advanced Features

### 1. Credential Automation and Orchestration

**Infrastructure as Code for Credentials:**
```yaml
# credential-config.yml
environments:
  development:
    network: base-sepolia
    auto_provision: true
    rotation_schedule: "0 0 */90 * *" # Every 90 days
    permissions:
      - testnet_read
      - testnet_write
    restrictions:
      - testnet_only
      - rate_limited
    
  production:
    network: base
    auto_provision: false # Manual approval required
    rotation_schedule: "0 2 */30 * *" # Every 30 days at 2 AM
    permissions:
      - read
      - write
      - admin
    restrictions:
      - monitored
      - mfa_required
    approval_required: true
```

**Orchestration Engine:**
```javascript
export class CredentialOrchestrator {
  async executeOrchestration(configPath) {
    const config = await this.loadConfiguration(configPath);
    
    for (const [env, envConfig] of Object.entries(config.environments)) {
      await this.orchestrateEnvironment(env, envConfig);
    }
  }

  async orchestrateEnvironment(environment, config) {
    console.log(`🎭 Orchestrating ${environment} environment...`);

    // Auto-provision if enabled
    if (config.auto_provision) {
      await this.autoProvision(environment, config);
    }

    // Schedule rotation
    await this.scheduleRotation(environment, config.rotation_schedule);

    // Apply permissions and restrictions
    await this.applyPolicies(environment, config);

    // Set up monitoring
    await this.setupMonitoring(environment, config);
  }
}
```

### 2. Integration with External Systems

**HashiCorp Vault Integration:**
```javascript
export class VaultIntegration {
  constructor(vaultConfig) {
    this.vault = new VaultClient(vaultConfig);
  }

  async storeCredentialsInVault(credentials, path) {
    // Encrypt credentials before storing
    const encrypted = await this.encryptCredentials(credentials);
    
    // Store in Vault with metadata
    await this.vault.write(path, {
      data: encrypted,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
        environment: credentials.environment
      }
    });
  }

  async retrieveCredentialsFromVault(path) {
    const data = await this.vault.read(path);
    return await this.decryptCredentials(data);
  }
}

**AWS Secrets Manager Integration:**
```javascript
export class AWSSecretsIntegration {
  constructor(region) {
    this.secretsManager = new AWS.SecretsManager({ region });
  }

  async storeSecret(secretName, credentials) {
    const params = {
      Name: secretName,
      SecretString: JSON.stringify(credentials),
      Description: `CDP credentials for ${credentials.environment}`
    };

    return await this.secretsManager.createSecret(params).promise();
  }

  async rotateSecret(secretName) {
    // Implement automatic rotation using AWS Lambda
    const params = {
      SecretId: secretName,
      RotationLambdaARN: process.env.ROTATION_LAMBDA_ARN
    };

    return await this.secretsManager.rotateSecret(params).promise();
  }
}
```

### 3. Monitoring and Alerting

**Real-time Credential Monitoring:**
```javascript
export class CredentialMonitor {
  async startMonitoring() {
    // Monitor credential usage patterns
    this.monitorUsagePatterns();
    
    // Monitor for security threats
    this.monitorSecurityThreats();
    
    // Monitor compliance status
    this.monitorCompliance();
    
    // Monitor system health
    this.monitorSystemHealth();
  }

  monitorUsagePatterns() {
    setInterval(async () => {
      const metrics = await this.collectUsageMetrics();
      
      // Detect anomalies
      const anomalies = this.detectAnomalies(metrics);
      
      if (anomalies.length > 0) {
        await this.alertOnAnomalies(anomalies);
      }
    }, 60000); // Every minute
  }

  async alertOnAnomalies(anomalies) {
    for (const anomaly of anomalies) {
      const alert = {
        severity: anomaly.severity,
        message: anomaly.description,
        timestamp: new Date(),
        environment: anomaly.environment,
        metrics: anomaly.metrics
      };

      await this.sendAlert(alert);
    }
  }
}
```

## 📊 Metrics and Reporting

### Key Performance Indicators

**Credential Management KPIs:**
- Mean Time to Provision (MTTP)
- Credential Rotation Success Rate
- Security Incident Response Time
- Compliance Score
- System Availability

**Monitoring Dashboard:**
```javascript
export class CredentialDashboard {
  async generateDashboard() {
    return {
      overview: await this.getOverviewMetrics(),
      environments: await this.getEnvironmentStatus(),
      security: await this.getSecurityMetrics(),
      compliance: await this.getComplianceStatus(),
      alerts: await this.getActiveAlerts(),
      trends: await this.getTrendAnalysis()
    };
  }

  async getOverviewMetrics() {
    return {
      totalCredentials: await this.countTotalCredentials(),
      activeEnvironments: await this.countActiveEnvironments(),
      rotationsThisMonth: await this.countRecentRotations(),
      securityIncidents: await this.countSecurityIncidents(),
      complianceScore: await this.calculateComplianceScore()
    };
  }
}
```

---

**This advanced credential management system provides enterprise-grade security, compliance, and operational capabilities while maintaining the simplicity of the automated setup for everyday development work.**
