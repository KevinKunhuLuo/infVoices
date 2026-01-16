/**
 * Auth Middleware for Password Protection
 *
 * 为应用添加登录页面保护
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 密码配置 - 从环境变量读取，fallback 到默认值
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "zxg111111";
const AUTH_USER = process.env.AUTH_USER || "admin";

// 不需要认证的路径
const PUBLIC_PATHS = ["/api/", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 路由和登录页面不需要保护
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 检查是否已认证（通过 cookie）
  const authCookie = request.cookies.get("auth_token");
  const expectedToken = Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

  if (authCookie?.value === expectedToken) {
    return NextResponse.next();
  }

  // 未认证，重定向到登录页面
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
