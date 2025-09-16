"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreateWalletForm } from "./CreateWalletForm";
import { WalletCard } from "./WalletCard";
import { FundingPanel } from "./FundingPanel";
import { Loader } from "@/components/ai-elements/loader";

interface Wallet {
  name: string;
  address: string;
  balances?: {
    usdc?: number | null;
    eth?: number | null;
  } | null;
  lastUpdated: string;
  error?: string;
}

interface WalletListResponse {
  wallets: Wallet[];
  count: number;
  lastUpdated: string;
}

export function WalletManager() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Load wallets on component mount
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/wallet/list");
      if (!response.ok) {
        throw new Error(`Failed to load wallets: ${response.statusText}`);
      }
      
      const data: WalletListResponse = await response.json();
      setWallets(data.wallets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async (name: string, type: "purchaser" | "seller" | "custom") => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create wallet");
      }

      const newWallet = await response.json();
      
      // Reload wallets to get the updated list with balances
      await loadWallets();
      setShowCreateForm(false);
      
      // Select the newly created wallet
      setSelectedWallet(newWallet.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefreshBalance = async (address: string) => {
    try {
      const response = await fetch(`/api/wallet/balance?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to refresh balance");
      }
      
      const balanceData = await response.json();
      
      // Update the specific wallet's balance
      setWallets(prevWallets =>
        prevWallets.map(wallet =>
          wallet.address === address
            ? {
                ...wallet,
                balances: {
                  usdc: balanceData.usdc ?? 0,
                  eth: balanceData.eth ?? 0,
                },
                lastUpdated: balanceData.lastUpdated,
                error: undefined
              }
            : wallet
        )
      );
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  };

  const handleWalletFunded = () => {
    // Reload all wallets after funding
    loadWallets();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Wallet Manager</h2>
        <div className="flex items-center justify-center py-8">
          <Loader />
          <span className="ml-2">Loading wallets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Wallet Manager</h2>
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Wallet"}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {showCreateForm && (
          <div className="mb-6">
            <CreateWalletForm
              onSubmit={handleCreateWallet}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isCreating}
            />
          </div>
        )}

        <div className="space-y-4">
          {wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No wallets found.</p>
              <p className="text-sm">Create your first wallet to get started!</p>
            </div>
          ) : (
            wallets.map((wallet) => (
              <WalletCard
                key={wallet.address}
                wallet={wallet}
                isSelected={selectedWallet === wallet.address}
                onSelect={() => setSelectedWallet(wallet.address)}
                onRefreshBalance={handleRefreshBalance}
              />
            ))
          )}
        </div>
      </div>

      {selectedWallet && (
        <FundingPanel
          walletAddress={selectedWallet}
          onFunded={handleWalletFunded}
        />
      )}
    </div>
  );
}
