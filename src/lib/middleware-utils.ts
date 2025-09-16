import { NextRequest } from "next/server";

/**
 * Lightweight utilities for middleware
 * These functions have minimal dependencies to keep the Edge Function bundle small
 */

/**
 * Check if a request is from a scraper/bot
 */
export function checkIsScraper(request: NextRequest): boolean {
  const scraperRegex =
    /Bot|AI2Bot|Ai2Bot-Dolma|aiHitBot|Amazonbot|anthropic-ai|Applebot|Applebot-Extended|Brightbot 1.0|Bytespider|CCBot|ChatGPT-User|Claude-Web|ClaudeBot|cohere-ai|cohere-training-data-crawler|Cotoyogi|Crawlspace|Diffbot|DuckAssistBot|FacebookBot|Factset_spyderbot|FirecrawlAgent|FriendlyCrawler|Google-Extended|GoogleOther|GoogleOther-Image|GoogleOther-Video|GPTBot|iaskspider\/2.0|ICC-Crawler|ImagesiftBot|img2dataset|ISSCyberRiskCrawler|Kangaroo Bot|meta-externalagent|Meta-ExternalAgent|meta-externalfetcher|Meta-ExternalFetcher|NovaAct|OAI-SearchBot|omgili|omgilibot|Operator|PanguBot|Perplexity-User|PerplexityBot|PetalBot|Scrapy|SemrushBot-OCOB|SemrushBot-SWA|Sidetrade indexer bot|TikTokSpider|Timpibot|VelenPublicWebCrawler|Webzio-Extended|YouBot/i;

  const userAgent = request.headers.get("user-agent");
  const botUserAgent = scraperRegex.test(userAgent ?? "");

  const manualBot = request.nextUrl.searchParams.get("bot") === "true";

  return botUserAgent || manualBot;
}

/**
 * Check if a request needs payment validation
 */
export function needsPaymentValidation(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  
  // Always validate API routes
  if (pathname.startsWith("/api")) {
    return true;
  }
  
  // For pages, only validate if it's a scraper/bot
  return checkIsScraper(request);
}

/**
 * Check if a route is protected and requires payment
 */
export function isProtectedRoute(pathname: string): boolean {
  // Exclude payment validation endpoint to avoid infinite loops
  if (pathname.startsWith("/api/payment-validate")) {
    return false;
  }
  
  const protectedRoutes = ["/blog", "/api/add"];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Build the payment validation URL
 */
export function buildPaymentValidationUrl(request: NextRequest): string {
  const baseUrl = request.nextUrl.origin;
  const validationUrl = new URL("/api/payment-validate", baseUrl);
  
  // Preserve original request parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    validationUrl.searchParams.set(key, value);
  });
  
  // Add original path for validation context
  validationUrl.searchParams.set("original_path", request.nextUrl.pathname);
  
  return validationUrl.toString();
}
