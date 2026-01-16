/**
 * Basic Auth Middleware for Password Protection
 *
 * 为应用添加简单的密码保护
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 密码配置 - 从环境变量读取，fallback 到默认值
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "zxg111111";
const AUTH_USER = process.env.AUTH_USER || "admin";

// 不需要认证的路径
const PUBLIC_PATHS = ["/api/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 路由不需要密码保护
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 检查是否已认证（通过 cookie）
  const authCookie = request.cookies.get("auth_token");
  if (authCookie?.value === Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64")) {
    return NextResponse.next();
  }

  // 检查 Basic Auth header
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString();
      const [user, password] = decoded.split(":");

      if (user === AUTH_USER && password === AUTH_PASSWORD) {
        // 认证成功，设置 cookie 避免重复认证
        const response = NextResponse.next();
        response.cookies.set("auth_token", encoded, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 天
        });
        return response;
      }
    }
  }

  // 返回 401 要求认证
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="InfVoices - 请输入访问密码"',
    },
  });
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
