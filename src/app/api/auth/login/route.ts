import { NextResponse } from "next/server";

// 密码配置 - 从环境变量读取，fallback 到默认值
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "zxg111111";
const AUTH_USER = process.env.AUTH_USER || "admin";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === AUTH_USER && password === AUTH_PASSWORD) {
      // 生成 token
      const token = Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

      // 创建响应并设置 cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "用户名或密码错误" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "登录失败" },
      { status: 500 }
    );
  }
}
