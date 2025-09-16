import { NextRequest, NextResponse } from "next/server";
import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";
import { env } from "../../../lib/env";

// This API route handles the heavy payment validation logic
// that was previously in the middleware, reducing the Edge Function bundle size

const network = env.NETWORK;

// Get seller address from environment (pre-generated)
function getSellerAddress(): string {
  const sellerAddress = process.env.SELLER_ADDRESS;
  if (!sellerAddress) {
    throw new Error("SELLER_ADDRESS environment variable is required");
  }
  return sellerAddress;
}

function createX402Middleware(sellerAddress: string) {
  return paymentMiddleware(
    sellerAddress,
    {
      // pages
      "/blog": {
        price: "$0.001",
        network,
        config: {
          description: "Access to protected content",
        },
      },
      // api routes
      "/api/add": {
        price: "$0.005",
        network,
        config: {
          description: "Access to protected content",
        },
      },
    },
    facilitator
  );
}

export async function GET(request: NextRequest) {
  try {
    const sellerAddress = getSellerAddress();
    const x402Middleware = createX402Middleware(sellerAddress);
    
    // Process the payment validation
    const response = await x402Middleware(request);
    
    return response;
  } catch (error) {
    console.error("Payment validation error:", error);
    return NextResponse.json(
      { error: "Payment validation failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
