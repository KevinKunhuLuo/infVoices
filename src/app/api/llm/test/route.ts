/**
 * LLM Test API Route
 *
 * POST /api/llm/test
 *
 * 测试 LLM 连接
 */

import { NextRequest, NextResponse } from "next/server";
import { getLLMManager } from "@/lib/llm";

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedModel = body.model;

    const manager = getLLMManager();
    const configuredProviders = manager.getConfiguredProviders();

    if (configuredProviders.length === 0) {
      return NextResponse.json({
        success: false,
        error: "未配置 LLM 服务",
      });
    }

    // 使用请求的模型或默认模型进行测试
    const model = requestedModel || process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const response = await manager.chat({
      messages: [{ role: "user", content: "Hi, just testing. Reply with 'OK'." }],
      model,
      maxTokens: 10,
    });

    return NextResponse.json({
      success: true,
      model: response.model,
      provider: response.provider,
    });
  } catch (error) {
    console.error("LLM test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "连接测试失败",
    });
  }
}
