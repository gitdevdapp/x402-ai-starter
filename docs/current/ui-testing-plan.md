# Homepage UI Testing Plan - September 16, 2025

## 🎯 Testing Overview

This document outlines the comprehensive testing strategy for the new homepage UI featuring wallet creation and testnet funding capabilities. All testing will be performed to ensure the new features integrate seamlessly with existing functionality.

## 📋 Testing Scope

### New Features to Test
1. **Wallet Creation Interface**
   - Create new Purchaser accounts
   - Create new Seller accounts  
   - Create custom-named accounts
   - Display wallet addresses and QR codes

2. **Balance Display System**
   - Real-time USDC balance updates
   - Real-time ETH balance updates
   - Balance refresh functionality
   - Loading states during balance checks

3. **Testnet Funding Interface**
   - One-click funding requests
   - Manual funding with custom amounts
   - Funding transaction status tracking
   - Transaction hash explorer links

4. **UI/UX Components**
   - Responsive wallet cards
   - Copy-to-clipboard functionality
   - Error state handling
   - Loading animations

### Existing Features to Verify (No Regression)
1. **AI Chat Interface**
   - Model selection (GPT-4o, Gemini 2.0 Flash Lite)
   - Message sending and receiving
   - Tool execution display
   - Conversation history

2. **Payment Integration**
   - Existing payment suggestions
   - x402 protocol functionality
   - Bot detection and payment validation
   - Middleware payment processing

## 🧪 Testing Strategy

### Phase 1: API Endpoint Testing

#### 1.1 Wallet Creation API (`/api/wallet/create`)
```bash
# Test purchaser account creation
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"name":"TestPurchaser","type":"purchaser"}'

# Expected: 201 status, valid address returned
# Verify: Address format (0x...), name stored correctly

# Test seller account creation  
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"name":"TestSeller","type":"seller"}'

# Test custom account creation
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"name":"CustomWallet","type":"custom"}'

# Test error cases
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"name":"","type":"invalid"}'
# Expected: 400 status with validation error
```

#### 1.2 Balance Checking API (`/api/wallet/balance`)
```bash
# Test balance retrieval
curl "http://localhost:3000/api/wallet/balance?address=0x..."

# Expected: 200 status, USDC and ETH balances
# Verify: Numeric values, proper formatting

# Test invalid address
curl "http://localhost:3000/api/wallet/balance?address=invalid"
# Expected: 400 status with error message

# Test non-existent address
curl "http://localhost:3000/api/wallet/balance?address=0x0000000000000000000000000000000000000000"
# Expected: 200 status with zero balances
```

#### 1.3 Funding API (`/api/wallet/fund`)
```bash
# Test USDC funding
curl -X POST http://localhost:3000/api/wallet/fund \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","token":"usdc"}'

# Expected: 202 status, transaction hash returned
# Verify: Valid transaction hash, status tracking

# Test ETH funding
curl -X POST http://localhost:3000/api/wallet/fund \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","token":"eth"}'

# Test rate limiting (if implemented)
# Make multiple rapid requests
# Expected: 429 status after limit reached
```

#### 1.4 Wallet Listing API (`/api/wallet/list`)
```bash
# Test wallet enumeration
curl http://localhost:3000/api/wallet/list

# Expected: 200 status, array of wallets with balances
# Verify: All created wallets appear, balances populated

# Test with no wallets (fresh environment)
# Expected: 200 status, empty array
```

### Phase 2: Frontend Component Testing

#### 2.1 WalletManager Component
**Test Cases:**
- [ ] Component renders without errors
- [ ] Create wallet button triggers modal/form
- [ ] Wallet creation form validation works
- [ ] Successful wallet creation updates UI
- [ ] Error states display properly
- [ ] Loading states show during creation

**Manual Testing Steps:**
1. Navigate to homepage
2. Verify WalletManager component is visible
3. Click "Create Wallet" button
4. Fill out wallet creation form
5. Submit and verify wallet appears in list
6. Test form validation with invalid inputs
7. Test network error scenarios

#### 2.2 WalletCard Component
**Test Cases:**
- [ ] Displays wallet name and address correctly
- [ ] Copy address functionality works
- [ ] Balance information updates in real-time
- [ ] Fund button triggers funding flow
- [ ] QR code generation (if implemented)
- [ ] Responsive design on mobile devices

**Manual Testing Steps:**
1. Create a test wallet
2. Verify wallet card displays all information
3. Test copy-to-clipboard functionality
4. Check balance display updates
5. Test fund button functionality
6. Verify responsive behavior

#### 2.3 FundingPanel Component
**Test Cases:**
- [ ] Funding request form validates inputs
- [ ] Supports both USDC and ETH funding
- [ ] Shows transaction status during funding
- [ ] Displays transaction hash on completion
- [ ] Handles funding failures gracefully
- [ ] Rate limiting feedback (if applicable)

**Manual Testing Steps:**
1. Select a wallet with low balance
2. Click fund button
3. Verify funding request is sent
4. Monitor transaction status updates
5. Confirm balance updates after funding
6. Test error scenarios (network issues, rate limits)

### Phase 3: Integration Testing

#### 3.1 Homepage Layout Integration
**Test Cases:**
- [ ] Wallet and chat sections display side-by-side on desktop
- [ ] Stacked layout works on mobile devices
- [ ] No layout conflicts between components
- [ ] Proper spacing and visual hierarchy
- [ ] All components load simultaneously

#### 3.2 AI Chat Integration (No Regression)
**Test Cases:**
- [ ] AI chat interface still functions normally
- [ ] Model selection works as before
- [ ] Payment suggestions still trigger properly
- [ ] Tool execution displays correctly
- [ ] No interference from wallet components

#### 3.3 Payment Flow Integration
**Test Cases:**
- [ ] Existing payment middleware still works
- [ ] Bot detection triggers payment validation
- [ ] New wallets can be used for payments
- [ ] Payment tool execution works with new UI
- [ ] No conflicts between wallet UI and payment flow

### Phase 4: User Experience Testing

#### 4.1 New User Journey
**Scenario**: First-time user discovers wallet functionality
1. User lands on homepage
2. User sees wallet creation option
3. User creates their first wallet
4. User receives testnet funds
5. User experiments with AI chat payments

**Success Criteria:**
- [ ] Wallet creation is intuitive and discoverable
- [ ] Funding process is clear and automatic
- [ ] User can complete full journey without confusion
- [ ] Error messages are helpful and actionable

#### 4.2 Existing User Journey (No Regression)
**Scenario**: Existing user returns to use AI chat
1. User navigates directly to AI chat
2. User sends AI messages as before
3. User tests payment functionality
4. User may or may not interact with wallet UI

**Success Criteria:**
- [ ] No disruption to existing workflow
- [ ] AI chat remains primary focus
- [ ] Payment functionality unchanged
- [ ] New wallet UI is complementary, not intrusive

#### 4.3 Power User Journey
**Scenario**: User creates multiple wallets and tests advanced features
1. User creates multiple wallet types
2. User funds wallets with different amounts
3. User tests balance checking and refresh
4. User uses different wallets for various AI tasks

**Success Criteria:**
- [ ] Multiple wallet management works smoothly
- [ ] Balance tracking scales well
- [ ] Performance remains good with many wallets
- [ ] Advanced features are discoverable

### Phase 5: Performance Testing

#### 5.1 Load Time Testing
**Metrics to Measure:**
- [ ] Initial page load time with wallet components
- [ ] Time to first wallet creation
- [ ] Balance refresh response time
- [ ] Bundle size impact analysis

**Targets:**
- Homepage load: <2 seconds
- Wallet creation: <3 seconds
- Balance updates: <1 second
- Bundle size increase: <100kB

#### 5.2 Concurrent User Testing
**Test Scenarios:**
- [ ] Multiple users creating wallets simultaneously
- [ ] Multiple funding requests in parallel
- [ ] Balance checking under load
- [ ] API rate limiting behavior

#### 5.3 Memory and Resource Usage
**Metrics to Monitor:**
- [ ] Memory usage with multiple wallets
- [ ] CPU usage during balance updates
- [ ] Network request frequency
- [ ] Local storage usage

### Phase 6: Error Handling Testing

#### 6.1 Network Failure Scenarios
**Test Cases:**
- [ ] Wallet creation during network outage
- [ ] Balance checking with timeout
- [ ] Funding requests with connection issues
- [ ] Graceful degradation of UI components

#### 6.2 API Error Scenarios
**Test Cases:**
- [ ] Invalid wallet creation requests
- [ ] Balance checking for invalid addresses
- [ ] Funding requests for non-existent wallets
- [ ] Rate limiting error handling
- [ ] Server error (500) responses

#### 6.3 User Input Validation
**Test Cases:**
- [ ] Invalid wallet names
- [ ] Malformed addresses
- [ ] Empty form submissions
- [ ] Special characters in inputs
- [ ] Extremely long inputs

### Phase 7: Security Testing

#### 7.1 Input Sanitization
**Test Cases:**
- [ ] XSS prevention in wallet names
- [ ] SQL injection prevention (if applicable)
- [ ] Address validation and sanitization
- [ ] CSRF protection on form submissions

#### 7.2 Access Control
**Test Cases:**
- [ ] Unauthorized wallet access prevention
- [ ] API endpoint security
- [ ] Rate limiting implementation
- [ ] Sensitive data exposure prevention

### Phase 8: Cross-Browser Testing

#### 8.1 Desktop Browsers
**Test Matrix:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 8.2 Mobile Browsers
**Test Matrix:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Firefox
- [ ] Samsung Internet

#### 8.3 Responsive Design Testing
**Breakpoints to Test:**
- [ ] Mobile (320px-768px)
- [ ] Tablet (768px-1024px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1440px+)

## 🎯 Success Criteria

### Functional Success
- [ ] All new wallet features work as designed
- [ ] No regression in existing AI chat functionality
- [ ] All API endpoints respond correctly
- [ ] Error handling provides clear feedback
- [ ] Performance targets are met

### User Experience Success
- [ ] New user journey is intuitive
- [ ] Existing users aren't disrupted
- [ ] Interface is responsive across devices
- [ ] Loading states provide good feedback
- [ ] Error messages are helpful

### Technical Success
- [ ] Bundle size increase is minimal
- [ ] No console errors in normal usage
- [ ] Memory usage remains reasonable
- [ ] API response times are acceptable
- [ ] Security requirements are met

## 📊 Testing Timeline

### Day 1: API Testing
- Morning: Set up testing environment
- Afternoon: Test all API endpoints
- Evening: Document API test results

### Day 2: Component Testing
- Morning: Test individual UI components
- Afternoon: Test component integration
- Evening: Mobile device testing

### Day 3: Integration & UX Testing
- Morning: Full user journey testing
- Afternoon: Performance and load testing
- Evening: Cross-browser validation

### Day 4: Bug Fixes & Regression Testing
- Morning: Fix identified issues
- Afternoon: Re-test fixed functionality
- Evening: Final regression testing

## 🔧 Test Environment Setup

### Local Development
```bash
# Start local development server
npm run dev

# Run tests in parallel terminal
npm run test

# Generate test wallets if needed
npm run generate-seller
```

### Production Testing
```bash
# Deploy to Vercel preview environment
vercel --env preview

# Run production tests
npm run test:production
```

### Test Data Management
- Use deterministic test wallet names
- Clean up test wallets after testing
- Use testnet only for all testing
- Document test account addresses

## 📝 Test Documentation

### Test Case Format
```
Test Case ID: TC-WM-001
Feature: Wallet Manager
Scenario: Create new purchaser account
Steps:
1. Navigate to homepage
2. Click "Create Wallet"
3. Enter name "TestPurchaser"
4. Select type "Purchaser"
5. Click "Create"
Expected Result: New wallet appears with valid address
Actual Result: [To be filled during testing]
Status: [Pass/Fail/Blocked]
```

### Bug Report Format
```
Bug ID: BUG-001
Severity: [Critical/High/Medium/Low]
Summary: Brief description
Steps to Reproduce:
1. Step one
2. Step two
Expected: What should happen
Actual: What actually happens
Environment: Browser, OS, etc.
```

---

**Status**: 🧪 **TESTING PLAN READY**  
**Next Step**: Begin API endpoint implementation  
**Testing Start**: After UI implementation is complete  
**Estimated Testing Duration**: 4 days including fixes
