import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";
import { z } from "zod";
import { createPublicClient, http } from "viem";
import { chain } from "@/lib/accounts";

const cdp = new CdpClient();

// USDC contract details for Base Sepolia
const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
] as const;

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

const balanceQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    const validation = balanceQuerySchema.safeParse({ address });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid address format", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get the account first, then get balances
    // Note: CDP requires getting the account to check balances
    // For external addresses, we'll use a simpler approach
    let balances;
    try {
      // Try to get account by address (this may not work for external addresses)
      const accounts = await cdp.evm.listAccounts();
      const accountsArray = Array.isArray(accounts) ? accounts : accounts.accounts || [];
      
      const account = accountsArray.find(acc => acc.address.toLowerCase() === validation.data.address.toLowerCase());
      
      if (account) {
        // If we found the account, get its balances
        balances = await account.listTokenBalances({
          network: env.NETWORK,
        });
      } else {
        // If account not found in our list, return zero balances
        balances = { balances: [] };
      }
    } catch (error) {
      console.error("Error fetching account balances:", error);
      // Fallback to zero balances
      balances = { balances: [] };
    }

    // Extract USDC and ETH balances with null safety
    const usdcBalance = balances?.balances?.find(
      (balance) => balance?.token?.symbol === "USDC"
    );
    
    const ethBalance = balances?.balances?.find(
      (balance) => balance?.token?.symbol === "ETH"
    );

    // Get CDP USDC amount
    const cdpUsdcAmount = usdcBalance?.amount ? Number(usdcBalance.amount) / 1000000 : 0;
    const ethAmount = ethBalance?.amount ? Number(ethBalance.amount) / 1000000000000000000 : 0;

    // Fallback: Direct contract balance check for USDC
    let contractUsdcAmount = 0;
    let balanceSource = 'cdp';
    
    try {
      if (env.NETWORK === "base-sepolia") {
        const contractBalance = await publicClient.readContract({
          address: USDC_CONTRACT_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'balanceOf',
          args: [validation.data.address as `0x${string}`]
        });
        
        contractUsdcAmount = Number(contractBalance) / 1000000; // USDC has 6 decimals
        
        // Use whichever method returns a higher balance (more accurate)
        if (contractUsdcAmount > cdpUsdcAmount) {
          balanceSource = 'contract';
        }
      }
    } catch (contractError) {
      console.warn("Direct contract balance check failed:", contractError);
      // Continue with CDP balance
    }

    // Use the higher of the two USDC balance readings
    const finalUsdcAmount = Math.max(cdpUsdcAmount, contractUsdcAmount);

    return NextResponse.json({
      usdc: isNaN(finalUsdcAmount) ? 0 : finalUsdcAmount,
      eth: isNaN(ethAmount) ? 0 : ethAmount, // Convert from wei to ETH
      lastUpdated: new Date().toISOString(),
      address: validation.data.address,
      balanceSource, // Indicate which method was used
      debug: {
        cdpUsdc: cdpUsdcAmount,
        contractUsdc: contractUsdcAmount,
        network: env.NETWORK
      }
    });

  } catch (error) {
    console.error("Balance check error:", error);
    return NextResponse.json(
      { error: "Failed to check balance", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
