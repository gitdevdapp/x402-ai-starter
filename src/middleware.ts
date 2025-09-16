import { NextRequest, NextResponse } from "next/server";
import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";
import { env } from "./lib/env";
import { getOrCreateSellerAccount } from "./lib/accounts";

const network = env.NETWORK;

// Cache for seller account to avoid recreating on every request
let sellerAccountCache: string | null = null;
let sellerAccountPromise: Promise<string> | null = null;

async function getSellerAccountAddress(): Promise<string> {
  if (sellerAccountCache) {
    return sellerAccountCache;
  }
  
  if (sellerAccountPromise) {
    return sellerAccountPromise;
  }
  
  sellerAccountPromise = (async () => {
    try {
      const account = await getOrCreateSellerAccount();
      sellerAccountCache = account.address;
      return account.address;
    } catch (error) {
      // Reset promise on error to allow retry
      sellerAccountPromise = null;
      throw error;
    }
  })();
  
  return sellerAccountPromise;
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

export default async function middleware(request: NextRequest) {
  try {
    // Initialize seller account if needed
    const sellerAddress = await getSellerAccountAddress();
    const x402Middleware = createX402Middleware(sellerAddress);
    
    // run middleware for all api routes
    if (request.nextUrl.pathname.startsWith("/api")) {
      return x402Middleware(request);
    } else {
      // for normal pages, only run middleware if it's a bot
      const isScraper = checkIsScraper(request);
      if (isScraper) {
        return x402Middleware(request);
      } else {
        return NextResponse.next();
      }
    }
  } catch (error) {
    // If seller account creation fails, log error and allow request to continue
    // This prevents middleware from completely blocking the application
    console.error("Middleware error - seller account initialization failed:", error);
    
    // For critical paths, you might want to return an error response instead
    // For now, we'll allow the request to continue without payment middleware
    return NextResponse.next();
  }
}

function checkIsScraper(request: NextRequest) {
  const scraperRegex =
    /Bot|AI2Bot|Ai2Bot-Dolma|aiHitBot|Amazonbot|anthropic-ai|Applebot|Applebot-Extended|Brightbot 1.0|Bytespider|CCBot|ChatGPT-User|Claude-Web|ClaudeBot|cohere-ai|cohere-training-data-crawler|Cotoyogi|Crawlspace|Diffbot|DuckAssistBot|FacebookBot|Factset_spyderbot|FirecrawlAgent|FriendlyCrawler|Google-Extended|GoogleOther|GoogleOther-Image|GoogleOther-Video|GPTBot|iaskspider\/2.0|ICC-Crawler|ImagesiftBot|img2dataset|ISSCyberRiskCrawler|Kangaroo Bot|meta-externalagent|Meta-ExternalAgent|meta-externalfetcher|Meta-ExternalFetcher|NovaAct|OAI-SearchBot|omgili|omgilibot|Operator|PanguBot|Perplexity-User|PerplexityBot|PetalBot|Scrapy|SemrushBot-OCOB|SemrushBot-SWA|Sidetrade indexer bot|TikTokSpider|Timpibot|VelenPublicWebCrawler|Webzio-Extended|YouBot/i;

  const userAgent = request.headers.get("user-agent");
  const botUserAgent = scraperRegex.test(userAgent ?? "");

  const manualBot = request.nextUrl.searchParams.get("bot") === "true";

  return botUserAgent || manualBot;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
