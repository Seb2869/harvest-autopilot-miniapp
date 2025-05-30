import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' 
      https://farcaster.xyz 
      https://client.farcaster.xyz 
      https://warpcast.com 
      https://client.warpcast.com 
      https://wrpcd.net 
      https://*.wrpcd.net 
      https://privy.farcaster.xyz 
      https://privy.warpcast.com 
      https://auth.privy.io 
      https://*.rpc.privy.systems 
      https://cloudflareinsights.com 
      https://explorer-api.walletconnect.com 
      https://*.walletconnect.com 
      https://*.walletconnect.org 
      https://*.base.org 
      https://mainnet.base.org
      https://base-mainnet.g.alchemy.com/*
      https://*.alchemy.com/*
      https://1rpc.io 
      wss://*.base.org 
      ws://*.base.org 
      http://*.base.org 
      https://*.base.org 
      https://relay.walletconnect.com 
      https://registry.walletconnect.com 
      https://verify.walletconnect.com 
      https://explorer-api.walletconnect.com 
      https://api.walletconnect.com 
      wss://*.walletconnect.com 
      https://*.walletconnect.org 
      wss://*.walletconnect.org
      https://api.portals.fi
      https://*.portals.fi;
  `
    .replace(/\s+/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  // Add CORS headers
  const allowedOrigins = [
    "https://wallet.farcaster.xyz",
    "https://client.warpcast.com",
    "https://explorer-api.walletconnect.com",
    "https://*.walletconnect.com",
    "https://*.walletconnect.org",
  ];

  const origin = request.headers.get("origin");

  if (
    origin &&
    allowedOrigins.some((allowed) =>
      allowed.includes("*")
        ? origin.endsWith(allowed.replace("*", ""))
        : origin === allowed,
    )
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE, HEAD",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
