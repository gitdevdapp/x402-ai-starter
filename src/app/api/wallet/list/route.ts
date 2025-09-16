import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";

const cdp = new CdpClient();

export async function GET(request: NextRequest) {
  try {
    // Get all accounts from CDP
    const accountsResponse = await cdp.evm.listAccounts();
    
    // Handle both array and object responses
    const accounts = Array.isArray(accountsResponse) 
      ? accountsResponse 
      : accountsResponse.accounts || [];

    // If no accounts, return empty list
    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      });
    }

    // Get balances for each account
    const walletsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        try {
          const balances = await account.listTokenBalances({
            network: env.NETWORK,
          });

          const usdcBalance = balances.balances.find(
            (balance) => balance.token.symbol === "USDC"
          );
          
          const ethBalance = balances.balances.find(
            (balance) => balance.token.symbol === "ETH"
          );

          return {
            name: account.name || "Unnamed Wallet",
            address: account.address,
            balances: {
              usdc: usdcBalance ? Number(usdcBalance.amount) / 1000000 : 0,
              eth: ethBalance ? Number(ethBalance.amount) / 1000000000000000000 : 0,
            },
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error getting balances for ${account.address}:`, error);
          return {
            name: account.name || "Unnamed Wallet",
            address: account.address,
            balances: {
              usdc: 0,
              eth: 0,
            },
            lastUpdated: new Date().toISOString(),
            error: "Failed to load balances"
          };
        }
      })
    );

    return NextResponse.json({
      wallets: walletsWithBalances,
      count: walletsWithBalances.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("List wallets error:", error);
    return NextResponse.json(
      { error: "Failed to list wallets", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
