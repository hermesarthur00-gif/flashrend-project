import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ACCOUNT = ["/account/connexion", "/account/inscription", "/account/confirmer-email", "/account/code", "/account/mot-de-passe", "/account/sw.js", "/account/manifest.webmanifest", "/account/icons", "/account/offline.html"];

/** Redirection rapide vers la connexion sans cookie de session. La vérification complète reste faite côté serveur. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ACCOUNT.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
  if (!getSessionCookie(request)) {
    const url = new URL("/account/connexion", request.url);
    if (pathname.startsWith("/admin")) url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/admin"],
};
