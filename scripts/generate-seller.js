#!/usr/bin/env node

/**
 * Seller Account Generation Script
 * 
 * This script generates a seller account address and outputs it for use
 * as an environment variable, eliminating the need to import heavy CDP SDK
 * dependencies in the Edge Runtime middleware.
 */

import { CdpClient } from "@coinbase/cdp-sdk";
import { toAccount } from "viem/accounts";

async function generateSellerAccount() {
  try {
    console.log("🔑 Generating seller account...");
    
    const cdp = new CdpClient();
    
    // Create or get existing seller account
    const account = await cdp.evm.getOrCreateAccount({
      name: "Seller",
    });
    
    const viemAccount = toAccount(account);
    
    console.log("✅ Seller account generated successfully!");
    console.log(`📍 Address: ${viemAccount.address}`);
    console.log("");
    console.log("🔧 Add this to your environment variables:");
    console.log(`SELLER_ADDRESS=${viemAccount.address}`);
    console.log("");
    console.log("📝 Or add to your .env file:");
    console.log(`echo "SELLER_ADDRESS=${viemAccount.address}" >> .env`);
    
    return viemAccount.address;
  } catch (error) {
    console.error("❌ Error generating seller account:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSellerAccount();
}

export { generateSellerAccount };
