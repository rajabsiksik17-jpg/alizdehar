import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar"] as const;
const defaultLocale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as string) || "en";
const COOKIE = "NEXT_LOCALE";

/**
 * Parse the Accept-Language header into an ordered list of language tags.
 * Handles quality values (e.g. "ar;q=0.9, en;q=0.8") and is locale-safe.
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      let q = 1;
      for (const p of params) {
        const [k, v] = p.trim().split("=");
        if (k.toLowerCase() === "q" && v) {
          const n = Number(v);
          if (!Number.isNaN(n)) q = n;
        }
      }
      return { tag: tag.trim().toLowerCase(), q };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
}

/**
 * Detect the best locale for a first-time visitor.
 * 1. A persisted choice (cookie) always wins.
 * 2. Otherwise parse Accept-Language intelligently.
 */
export function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale;

  const tags = parseAcceptLanguage(acceptLanguage);
  for (const tag of tags) {
    if (tag === "ar" || tag.startsWith("ar-")) return "ar";
    if (tag === "en" || tag.startsWith("en-")) return "en";
    if (tag === "ar") break;
  }

  // Fall back to a broader heuristic if the exact tags didn't match.
  if (acceptLanguage.toLowerCase().includes("ar")) return "ar";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets (any path with a file extension)
  if (pathname.includes(".")) return NextResponse.next();

  // Explicit locale in the URL — never rewrite; the user is on a concrete page.
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  // A saved preference overrides auto-detection.
  const cookie = request.cookies.get(COOKIE)?.value;
  let locale: string;
  if (cookie && locales.includes(cookie as (typeof locales)[number])) {
    locale = cookie;
  } else {
    locale = detectLocale(request.headers.get("accept-language"));
  }

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(request.nextUrl);
  // Only persist the auto-detected value on first visit; the switcher sets it thereafter.
  if (!cookie) {
    response.cookies.set(COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|api|admin|sitemap.xml|robots.txt|manifest.webmanifest|favicon.ico|icon.svg).*)",
  ],
};
