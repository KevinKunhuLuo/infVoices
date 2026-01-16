/**
 * 简单密码保护中间件
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 不需要认证的路径
const PUBLIC_PATHS = ["/login", "/api/", "/_next/", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径不需要验证
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 检查 cookie
  const authCookie = request.cookies.get("auth_token");

  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // 未登录，重定向到登录页
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
