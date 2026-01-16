/**
 * LLM Config API Route
 *
 * GET /api/llm/config
 *
 * 返回 LLM 配置状态（不暴露敏感信息）
 */

import { NextResponse } from "next/server";

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  return NextResponse.json({
    configured: !!apiKey,
    defaultModel: model,
  });
}
