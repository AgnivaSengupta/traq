// proxy.ts
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardPage = pathname.startsWith("/dashboard");

  // Check for the session token in cookies
  // Better Auth uses "better-auth.session_token" by default (or similar depending on config)
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Logic: If trying to access dashboard AND no session cookie exists -> Redirect
  if (isDashboardPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}