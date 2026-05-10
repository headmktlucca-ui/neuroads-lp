import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const accept = request.headers.get("accept") ?? "";

  // Prevent stale HTML documents from being cached across deploys.
  if (request.method === "GET" && accept.includes("text/html")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
