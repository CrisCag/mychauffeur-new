import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale } from "@/lib/i18n-config";

const legacyPaths: Record<string, string> = {
  "/": `/${defaultLocale}`,
  "/servizi": `/${defaultLocale}/servizi`,
  "/privacy": `/${defaultLocale}/privacy`,
  "/cookie": `/${defaultLocale}/cookie`,
  "/cookies": `/${defaultLocale}/cookie`,
};

export function proxy(request: NextRequest) {
  const target = legacyPaths[request.nextUrl.pathname];
  if (target) {
    return NextResponse.redirect(new URL(target, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/servizi", "/privacy", "/cookie", "/cookies"],
};
