"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  ArrowRight,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
  data?: any;
}

interface WalletTestData {
  address: string;
  name: string;
  initialUsdcBalance: number;
  initialEthBalance: number;
  fundedUsdcBalance: number;
  fundedEthBalance: number;
}

export default function WalletFlowTestPage() {
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    { id: 'create', name: 'Create New Wallet', status: 'pending' },
    { id: 'initial-balance', name: 'Verify Initial Zero Balances', status: 'pending' },
    { id: 'fund-usdc', name: 'Fund Wallet with USDC', status: 'pending' },
    { id: 'verify-usdc', name: 'Verify USDC Balance Display', status: 'pending' },
    { id: 'fund-eth', name: 'Fund Wallet with ETH', status: 'pending' },
    { id: 'verify-eth', name: 'Verify ETH Balance Display', status: 'pending' },
    { id: 'final-check', name: 'Final Balance Verification', status: 'pending' },
    { id: 'cleanup', name: 'Clean Up Test Wallet', status: 'pending' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState<WalletTestData | null>(null);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    errors: string[];
    warnings: string[];
    walletAddress?: string;
    explorerLinks: string[];
  } | null>(null);

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setTestSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setTestResults(null);
    setTestData(null);

    const errors: string[] = [];
    const warnings: string[] = [];
    const explorerLinks: string[] = [];
    let walletData: WalletTestData | null = null;

    try {
      // Step 1: Create New Wallet
      updateStep('create', { status: 'running', message: 'Creating test wallet...' });
      const startTime = Date.now();

      const createResponse = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test-Wallet-${Date.now()}`,
          type: 'custom'
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create wallet: ${createResponse.statusText}`);
      }

      const walletInfo = await createResponse.json();
      const createDuration = Date.now() - startTime;

      walletData = {
        address: walletInfo.address,
        name: walletInfo.name,
        initialUsdcBalance: 0,
        initialEthBalance: 0,
        fundedUsdcBalance: 0,
        fundedEthBalance: 0
      };

      setTestData(walletData);
      updateStep('create', { 
        status: 'success', 
        message: `Wallet created: ${walletInfo.address}`, 
        duration: createDuration,
        data: walletInfo
      });

      await sleep(2000);

      // Step 2: Verify Initial Zero Balances
      updateStep('initial-balance', { status: 'running', message: 'Checking initial balances...' });
      const balanceStartTime = Date.now();

      const initialBalanceResponse = await fetch(`/api/wallet/balance?address=${walletData.address}`);
      if (!initialBalanceResponse.ok) {
        throw new Error('Failed to check initial balance');
      }

      const initialBalance = await initialBalanceResponse.json();
      const balanceDuration = Date.now() - balanceStartTime;

      walletData.initialUsdcBalance = initialBalance.usdc;
      walletData.initialEthBalance = initialBalance.eth;

      if (initialBalance.usdc !== 0 || initialBalance.eth !== 0) {
        warnings.push(`Initial balances not zero: USDC=${initialBalance.usdc}, ETH=${initialBalance.eth}`);
      }

      updateStep('initial-balance', { 
        status: 'success', 
        message: `Initial: ${initialBalance.usdc.toFixed(4)} USDC, ${initialBalance.eth.toFixed(6)} ETH`,
        duration: balanceDuration,
        data: initialBalance
      });

      await sleep(2000);

      // Step 3: Fund with USDC
      updateStep('fund-usdc', { status: 'running', message: 'Requesting USDC from faucet...' });
      const usdcFundStartTime = Date.now();

      const usdcFundResponse = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletData.address,
          token: 'usdc'
        })
      });

      if (!usdcFundResponse.ok) {
        const errorData = await usdcFundResponse.json();
        throw new Error(`USDC funding failed: ${errorData.error || usdcFundResponse.statusText}`);
      }

      const usdcFundResult = await usdcFundResponse.json();
      const usdcFundDuration = Date.now() - usdcFundStartTime;

      if (usdcFundResult.explorerUrl) {
        explorerLinks.push(usdcFundResult.explorerUrl);
      }

      updateStep('fund-usdc', { 
        status: 'success', 
        message: `USDC funding transaction: ${usdcFundResult.transactionHash}`,
        duration: usdcFundDuration,
        data: usdcFundResult
      });

      await sleep(3000);

      // Step 4: Verify USDC Balance
      updateStep('verify-usdc', { status: 'running', message: 'Waiting for USDC balance update...' });
      const verifyUsdcStartTime = Date.now();

      let usdcVerified = false;
      let usdcAttempts = 0;
      const maxUsdcAttempts = 12; // 60 seconds max

      while (!usdcVerified && usdcAttempts < maxUsdcAttempts) {
        usdcAttempts++;
        updateStep('verify-usdc', { 
          status: 'running', 
          message: `Checking USDC balance... (${usdcAttempts}/${maxUsdcAttempts})` 
        });

        const usdcBalanceResponse = await fetch(`/api/wallet/balance?address=${walletData.address}`);
        if (usdcBalanceResponse.ok) {
          const usdcBalance = await usdcBalanceResponse.json();
          
          if (usdcBalance.usdc > 0) {
            walletData.fundedUsdcBalance = usdcBalance.usdc;
            usdcVerified = true;
            
            const verifyUsdcDuration = Date.now() - verifyUsdcStartTime;
            updateStep('verify-usdc', { 
              status: 'success', 
              message: `USDC balance confirmed: ${usdcBalance.usdc.toFixed(4)} USDC`,
              duration: verifyUsdcDuration,
              data: usdcBalance
            });
          }
        }

        if (!usdcVerified) {
          await sleep(5000);
        }
      }

      if (!usdcVerified) {
        warnings.push('USDC balance did not update within 60 seconds');
        updateStep('verify-usdc', { 
          status: 'error', 
          message: 'USDC balance verification timeout'
        });
      }

      await sleep(2000);

      // Step 5: Fund with ETH
      updateStep('fund-eth', { status: 'running', message: 'Requesting ETH from faucet...' });
      const ethFundStartTime = Date.now();

      const ethFundResponse = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletData.address,
          token: 'eth'
        })
      });

      if (!ethFundResponse.ok) {
        const errorData = await ethFundResponse.json();
        throw new Error(`ETH funding failed: ${errorData.error || ethFundResponse.statusText}`);
      }

      const ethFundResult = await ethFundResponse.json();
      const ethFundDuration = Date.now() - ethFundStartTime;

      if (ethFundResult.explorerUrl) {
        explorerLinks.push(ethFundResult.explorerUrl);
      }

      updateStep('fund-eth', { 
        status: 'success', 
        message: `ETH funding transaction: ${ethFundResult.transactionHash}`,
        duration: ethFundDuration,
        data: ethFundResult
      });

      await sleep(3000);

      // Step 6: Verify ETH Balance
      updateStep('verify-eth', { status: 'running', message: 'Waiting for ETH balance update...' });
      const verifyEthStartTime = Date.now();

      let ethVerified = false;
      let ethAttempts = 0;
      const maxEthAttempts = 12; // 60 seconds max

      while (!ethVerified && ethAttempts < maxEthAttempts) {
        ethAttempts++;
        updateStep('verify-eth', { 
          status: 'running', 
          message: `Checking ETH balance... (${ethAttempts}/${maxEthAttempts})` 
        });

        const ethBalanceResponse = await fetch(`/api/wallet/balance?address=${walletData.address}`);
        if (ethBalanceResponse.ok) {
          const ethBalance = await ethBalanceResponse.json();
          
          if (ethBalance.eth > 0) {
            walletData.fundedEthBalance = ethBalance.eth;
            ethVerified = true;
            
            const verifyEthDuration = Date.now() - verifyEthStartTime;
            updateStep('verify-eth', { 
              status: 'success', 
              message: `ETH balance confirmed: ${ethBalance.eth.toFixed(6)} ETH`,
              duration: verifyEthDuration,
              data: ethBalance
            });
          }
        }

        if (!ethVerified) {
          await sleep(5000);
        }
      }

      if (!ethVerified) {
        warnings.push('ETH balance did not update within 60 seconds');
        updateStep('verify-eth', { 
          status: 'error', 
          message: 'ETH balance verification timeout'
        });
      }

      await sleep(2000);

      // Step 7: Final Balance Check
      updateStep('final-check', { status: 'running', message: 'Final balance verification...' });
      const finalCheckStartTime = Date.now();

      const finalBalanceResponse = await fetch(`/api/wallet/balance?address=${walletData.address}`);
      if (!finalBalanceResponse.ok) {
        throw new Error('Failed to get final balance');
      }

      const finalBalance = await finalBalanceResponse.json();
      const finalCheckDuration = Date.now() - finalCheckStartTime;

      const hasPositiveUsdc = finalBalance.usdc > 0;
      const hasPositiveEth = finalBalance.eth > 0;

      if (hasPositiveUsdc && hasPositiveEth) {
        updateStep('final-check', { 
          status: 'success', 
          message: `✅ Both balances positive: ${finalBalance.usdc.toFixed(4)} USDC, ${finalBalance.eth.toFixed(6)} ETH`,
          duration: finalCheckDuration,
          data: finalBalance
        });
      } else {
        const missingTokens = [];
        if (!hasPositiveUsdc) missingTokens.push('USDC');
        if (!hasPositiveEth) missingTokens.push('ETH');
        
        updateStep('final-check', { 
          status: 'error', 
          message: `❌ Missing positive balances for: ${missingTokens.join(', ')}`
        });
        
        errors.push(`Final balance check failed: ${missingTokens.join(', ')} balance(s) not positive`);
      }

      await sleep(1000);

      // Step 8: Cleanup (Optional)
      updateStep('cleanup', { status: 'running', message: 'Test completed. Wallet preserved for manual inspection.' });
      
      // Note: We don't actually delete the wallet since CDP doesn't support wallet deletion
      // The wallet will remain for manual inspection
      updateStep('cleanup', { 
        status: 'success', 
        message: 'Test wallet preserved for manual verification'
      });

      // Set final results
      const success = errors.length === 0 && hasPositiveUsdc && hasPositiveEth;
      setTestResults({
        success,
        errors,
        warnings,
        walletAddress: walletData.address,
        explorerLinks
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      
      setTestResults({
        success: false,
        errors,
        warnings,
        walletAddress: walletData?.address,
        explorerLinks
      });

      // Update current step as error
      const runningStep = testSteps.find(step => step.status === 'running');
      if (runningStep) {
        updateStep(runningStep.id, { status: 'error', message: errorMessage });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const resetTest = () => {
    setTestSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, duration: undefined, data: undefined })));
    setTestResults(null);
    setTestData(null);
  };

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet Flow Test</h1>
          <p className="text-gray-600">
            Comprehensive test to verify wallet creation, funding, and balance display functionality.
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={runTest} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Test
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetTest} 
                disabled={isRunning}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStepIcon(step.status)}
                    <span className="font-medium">{index + 1}. {step.name}</span>
                    {step.duration && (
                      <span className="text-sm text-gray-500">({step.duration}ms)</span>
                    )}
                  </div>
                  {step.message && (
                    <div className="text-sm text-gray-600 flex-1">
                      {step.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Status */}
                <div className={`p-4 rounded-lg ${testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="font-medium">
                    {testResults.success ? (
                      <span className="text-green-800">✅ Test Passed: Both USDC and ETH balances are positive</span>
                    ) : (
                      <span className="text-red-800">❌ Test Failed: Requirements not met</span>
                    )}
                  </div>
                </div>

                {/* Wallet Information */}
                {testResults.walletAddress && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800 mb-2">Test Wallet Created</div>
                    <div className="text-sm font-mono bg-white p-2 rounded border">
                      {testResults.walletAddress}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(`https://sepolia.basescan.org/address/${testResults.walletAddress}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Base Sepolia Explorer
                    </Button>
                  </div>
                )}

                {/* Test Data Summary */}
                {testData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium mb-2">USDC Balance</div>
                      <div className="text-sm">Initial: {testData.initialUsdcBalance.toFixed(4)}</div>
                      <div className="text-sm">Final: {testData.fundedUsdcBalance.toFixed(4)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium mb-2">ETH Balance</div>
                      <div className="text-sm">Initial: {testData.initialEthBalance.toFixed(6)}</div>
                      <div className="text-sm">Final: {testData.fundedEthBalance.toFixed(6)}</div>
                    </div>
                  </div>
                )}

                {/* Explorer Links */}
                {testResults.explorerLinks.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-2">Transaction Links</div>
                    <div className="space-y-2">
                      {testResults.explorerLinks.map((link, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link, '_blank')}
                          className="mr-2"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Transaction {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {testResults.errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800 mb-2">Errors</div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {testResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {testResults.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800 mb-2">Warnings</div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {testResults.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                This test verifies the complete wallet funding and balance display flow:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Creates a new custom wallet</li>
                <li>Verifies initial balances are zero</li>
                <li>Funds the wallet with USDC from the testnet faucet</li>
                <li>Waits for and verifies USDC balance becomes positive</li>
                <li>Funds the wallet with ETH from the testnet faucet</li>
                <li>Waits for and verifies ETH balance becomes positive</li>
                <li>Performs final verification that both balances are positive</li>
                <li>Preserves the test wallet for manual inspection</li>
              </ol>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Note:</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  The test will only pass if BOTH USDC and ETH balances show as positive values.
                  This proves the balance display system works correctly for new wallets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
