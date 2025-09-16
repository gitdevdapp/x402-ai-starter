import { NextRequest, NextResponse } from "next/server";
import { needsPaymentValidation, isProtectedRoute } from "./lib/middleware-utils";

/**
 * Lightweight middleware that delegates payment validation to API routes
 * This approach reduces the Edge Function bundle size by avoiding heavy dependencies
 */
export default async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Skip middleware for non-protected routes
    if (!isProtectedRoute(pathname)) {
      return NextResponse.next();
    }
    
    // Check if this request needs payment validation
    if (!needsPaymentValidation(request)) {
      return NextResponse.next();
    }
    
    // Delegate to payment validation API route
    const paymentValidationUrl = new URL("/api/payment-validate", request.url);
    
    // Preserve original path information
    paymentValidationUrl.searchParams.set("original_path", pathname);
    
    // Forward the original request to the payment validation endpoint
    const paymentRequest = new Request(paymentValidationUrl, {
      method: request.method,
      headers: request.headers,
      // Only include body for non-GET requests
      body: request.method !== "GET" ? request.body : undefined,
    });
    
    // Get the validation response
    const response = await fetch(paymentRequest);
    
    // If payment validation passes, allow the request to continue
    if (response.ok) {
      return NextResponse.next();
    }
    
    // If payment validation fails, return an error response
    const responseText = await response.text();
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
  } catch (error) {
    // If payment validation fails for any reason, log error and allow request to continue
    // This prevents middleware from completely blocking the application
    console.error("Middleware error - payment validation failed:", error);
    
    // For critical paths, you might want to return an error response instead
    // For now, we'll allow the request to continue without payment middleware
    return NextResponse.next();
  }
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
