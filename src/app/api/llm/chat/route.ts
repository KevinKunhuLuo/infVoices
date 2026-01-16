/**
 * LLM Chat API Route
 *
 * POST /api/llm/chat
 */

import { NextRequest, NextResponse } from "next/server";
import { getLLMManager } from "@/lib/llm";
import type { LLMProvider, ChatMessage } from "@/lib/llm";

interface ChatRequestBody {
  messages: ChatMessage[];
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();

    const { messages, provider, model, temperature, maxTokens } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // 获取 LLM 管理器
    const manager = getLLMManager();

    // 检查是否有可用的提供商
    const configuredProviders = manager.getConfiguredProviders();
    if (configuredProviders.length === 0) {
      return NextResponse.json(
        {
          error: "No LLM providers configured. Please set API keys.",
          details: "Set VOLCENGINE_API_KEY or OPENROUTER_API_KEY environment variables",
        },
        { status: 503 }
      );
    }

    // 发送请求
    const response = await manager.chat(
      {
        messages,
        model,
        temperature,
        maxTokens,
      },
      provider
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("LLM chat error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "LLM request failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// 获取可用的提供商
export async function GET() {
  try {
    const manager = getLLMManager();
    const providers = manager.getConfiguredProviders();
    const availability = await manager.checkAvailability();

    return NextResponse.json({
      success: true,
      data: {
        providers,
        availability,
      },
    });
  } catch (error) {
    console.error("LLM status check error:", error);

    return NextResponse.json(
      { error: "Failed to check LLM status" },
      { status: 500 }
    );
  }
}
