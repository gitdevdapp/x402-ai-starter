"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";

interface FundingPanelProps {
  walletAddress: string;
  onFunded: () => void;
}

interface FundingTransaction {
  transactionHash: string;
  status: "pending" | "success" | "failed";
  token: string;
  explorerUrl?: string;
  timestamp: string;
  amount?: string;
}

export function FundingPanel({ walletAddress, onFunded }: FundingPanelProps) {
  const [selectedToken, setSelectedToken] = useState<"usdc" | "eth">("usdc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<FundingTransaction[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<FundingTransaction | null>(null);

  const handleFundWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          token: selectedToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fund wallet");
      }

      const result = await response.json();
      
      // Determine amount based on token type
      const amount = selectedToken === "usdc" ? "1.0 USDC" : "0.001 ETH";
      
      // Add transaction to recent transactions
      const newTransaction: FundingTransaction = {
        transactionHash: result.transactionHash,
        status: result.status === "success" ? "success" : "pending",
        token: result.token,
        explorerUrl: result.explorerUrl,
        timestamp: new Date().toISOString(),
        amount,
      };

      setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 4)]);
      setLastTransaction(newTransaction);
      
      // Set success message
      if (result.status === "success") {
        setSuccessMessage(`Successfully funded wallet with ${amount}! Transaction confirmed on blockchain.`);
        
        // Auto-refresh balance after 3 seconds
        setTimeout(() => {
          onFunded();
        }, 3000);
      }
      
    } catch (err) {
      if (err instanceof Error && err.message.includes("rate limit")) {
        setError("Rate limit exceeded. Please wait before requesting more funds.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to fund wallet");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTransactionHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Fund Wallet</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Selected Wallet:</div>
        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {formatAddress(walletAddress)}
        </code>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Token to Fund
          </label>
          <Select value={selectedToken} onValueChange={(value: "usdc" | "eth") => setSelectedToken(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usdc">
                <div>
                  <div className="font-medium">USDC</div>
                  <div className="text-sm text-gray-500">USD Coin (for payments)</div>
                </div>
              </SelectItem>
              <SelectItem value="eth">
                <div>
                  <div className="font-medium">ETH</div>
                  <div className="text-sm text-gray-500">Ethereum (for gas fees)</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Funding Successful!</span>
            </div>
            <p className="text-sm mb-3">{successMessage}</p>
            {lastTransaction?.explorerUrl && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(lastTransaction.explorerUrl, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Transaction on Base Sepolia Explorer
              </Button>
            )}
          </div>
        )}

        <Button
          onClick={handleFundWallet}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Requesting Funds..." : `Fund with ${selectedToken.toUpperCase()}`}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Testnet Faucet:</strong> Free funds for Base Sepolia testnet only</p>
          <p><strong>Rate Limits:</strong> One request per token per 24 hours per address</p>
          <p><strong>Amounts:</strong> ~$1 USDC or ~0.001 ETH per request</p>
        </div>

        {recentTransactions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Funding Transactions</h4>
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.transactionHash} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.status)}
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">
                        {formatTransactionHash(tx.transactionHash)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {tx.amount || tx.token} • {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {tx.explorerUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tx.explorerUrl, '_blank')}
                      className="p-2 h-auto hover:bg-gray-200"
                      title="View on Block Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
