"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Wallet {
  name: string;
  address: string;
  balances: {
    usdc: number;
    eth: number;
  };
  lastUpdated: string;
  error?: string;
}

interface WalletCardProps {
  wallet: Wallet;
  isSelected: boolean;
  onSelect: () => void;
  onRefreshBalance: (address: string) => void;
}

export function WalletCard({ wallet, isSelected, onSelect, onRefreshBalance }: WalletCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshBalance(wallet.address);
    setIsRefreshing(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  const getTimestamp = () => {
    try {
      return new Date(wallet.lastUpdated).toLocaleTimeString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all",
        isSelected 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900">{wallet.name}</h3>
            {wallet.error && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                Error
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <code className="text-sm text-gray-600 font-mono">
              {formatAddress(wallet.address)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyAddress();
              }}
              className="p-1 h-auto"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {copySuccess && (
              <span className="text-xs text-green-600">Copied!</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div className="text-xs text-gray-500">USDC</div>
              <div className="font-mono text-sm">
                ${formatBalance(wallet.balances.usdc)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">ETH</div>
              <div className="font-mono text-sm">
                {formatBalance(wallet.balances.eth)} ETH
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Updated: {getTimestamp()}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing}
            className="p-2"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://sepolia.basescan.org/address/${wallet.address}`, '_blank');
            }}
            className="p-2"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
