import { NextResponse, type NextRequest } from "next/server";
import { adminAccess } from "./lib/admin-auth";
export function proxy(request: NextRequest) {
  const denied = adminAccess(request);
  if (denied) return denied;
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
