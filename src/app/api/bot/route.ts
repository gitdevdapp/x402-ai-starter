import { env } from "@/lib/env";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { wrapFetchWithPayment } from "x402-fetch";
import { chain, getOrCreatePurchaserAccount } from "@/lib/accounts";
import { createWalletClient, http } from "viem";
import { waitUntil } from "@vercel/functions";

type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

// ✅ Lazy initialization with caching to fix Vercel client-side exception
let walletClientCache: any = null;
let walletClientPromise: Promise<any> | null = null;

async function getWalletClient() {
  if (walletClientCache) return walletClientCache;
  if (walletClientPromise) return walletClientPromise;

  walletClientPromise = (async () => {
    try {
      const account = await getOrCreatePurchaserAccount();
      walletClientCache = createWalletClient({
        chain,
        transport: http(),
        account,
      });
      return walletClientCache;
    } catch (error) {
      console.error("Failed to initialize wallet client:", error);
      // Reset promise to allow retry
      walletClientPromise = null;
      throw error;
    }
  })();

  return walletClientPromise;
}

export async function GET(request: NextRequest) {
  const enablePayment =
    request.nextUrl.searchParams.get("enable-payment") === "true";
  const isBot = request.headers.get("user-agent")?.includes("bot") ?? false;
  const actAsScraper =
    request.nextUrl.searchParams.get("act-as-scraper") === "true";
  const job = request.nextUrl.searchParams.get("job");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const log = (...args: unknown[]) => {
        const message = args
          .map((arg) => {
            if (typeof arg === "string") {
              return arg;
            } else if (typeof arg === "object" && arg !== null) {
              return JSON.stringify(arg, null, 2);
            } else {
              return String(arg);
            }
          })
          .join(" ");

        const sseData = `data: ${JSON.stringify({
          timestamp: new Date().toISOString(),
          message,
        })}\n\n`;

        controller.enqueue(encoder.encode(sseData));
        console.log(...args);
      };

      const jobPromise = (async () => {
        try {
          log("initiating job", job);
          
          // ✅ Get wallet client dynamically when needed
          const walletClient = enablePayment ? await getWalletClient() : null;
          
          const loggedFetch = makeLoggedFetch(log);
          const fetch = enablePayment && walletClient
            ? wrapFetchWithPayment(loggedFetch, walletClient as any) // TODO: fix type
            : loggedFetch;
          let result;
          if (job === "scrape") {
            result = await scrapeJob(fetch, isBot || actAsScraper);
          } else if (job === "math") {
            result = await mathJob(fetch);
          } else {
            log("Invalid job specified");
            result = { error: "Invalid job" };
          }

          // Send final result
          const finalData = `data: ${JSON.stringify({
            timestamp: new Date().toISOString(),
            type: "result",
            result,
          })}\n\n`;
          controller.enqueue(encoder.encode(finalData));
        } catch (error) {
          const errorData = `data: ${JSON.stringify({
            timestamp: new Date().toISOString(),
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
        } finally {
          controller.close();
        }
      })();

      waitUntil(jobPromise);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers":
        "Content-Type, enable-payment, act-as-scraper",
    },
  });
}

function makeLoggedFetch(
  log: (...args: unknown[]) => void
): typeof globalThis.fetch {
  return async (...args) => {
    const info = args[0];
    const path =
      info instanceof Request
        ? new URL(info.url).pathname
        : new URL(info).pathname;
    log("Request: ", args[1]?.method ?? "GET", path);
    log("Request Headers: ", args[1]?.headers ?? {});
    const rawResponse = await fetch(...args);
    const clonedResponse = rawResponse.clone();
    log(
      "Response: ",
      args[1]?.method ?? "GET",
      path,
      clonedResponse.status,
      clonedResponse.statusText
    );
    log("Response Headers: ", clonedResponse.headers);
    const body = await clonedResponse.text();
    try {
      const json = JSON.parse(body);
      log("Response Body: ", json);
    } catch (error) {
      log("Response Body: ", body);
    }
    return rawResponse;
  };
}

async function scrapeJob(fetch: Fetch, isBot: boolean) {
  const response = await fetch(`${env.URL}/blog`, {
    headers: {
      ...(isBot ? { "user-agent": "Bot" } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("An error occurred: " + response.statusText);
  }

  const blogData = await response.text();

  const $ = cheerio.load(blogData);
  const blogTitles = $("h2")
    .map((_, el) => $(el).text().trim())
    .get();

  return { blogTitles };
}

async function mathJob(fetch: Fetch) {
  const response = await fetch(`${env.URL}/api/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      a: 1,
      b: 2,
    }),
  });

  if (!response.ok) {
    throw new Error("An error occurred: " + response.statusText);
  }

  const result = await response.json();

  return result;
}
