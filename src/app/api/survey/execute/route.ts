/**
 * Survey Execution API Route
 *
 * POST /api/survey/execute
 *
 * 执行单个角色的问卷调研
 */

import { NextRequest, NextResponse } from "next/server";
import { getLLMManager, generateSurveyPrompt, parseAnswersFromResponse } from "@/lib/llm";
import type { Persona } from "@/lib/supabase";
import type { SurveyQuestion } from "@/lib/survey";
import type { SurveyResponse, SurveyAnswer, LLMProvider } from "@/lib/llm";

interface ExecuteRequestBody {
  persona: Persona;
  questions: SurveyQuestion[];
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ExecuteRequestBody = await request.json();
    const { persona, questions, provider, model, temperature = 0.7 } = body;

    // 验证输入
    if (!persona || !persona.id) {
      return NextResponse.json(
        { error: "Valid persona is required" },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Questions array is required" },
        { status: 400 }
      );
    }

    // 获取 LLM 管理器
    const manager = getLLMManager();

    // 检查提供商可用性
    const configuredProviders = manager.getConfiguredProviders();
    if (configuredProviders.length === 0) {
      return NextResponse.json(
        {
          error: "No LLM providers configured",
          details: "Please configure VOLCENGINE_API_KEY or OPENROUTER_API_KEY",
        },
        { status: 503 }
      );
    }

    // 生成提示词
    const { systemPrompt, userPrompt } = generateSurveyPrompt(persona, questions);

    // 调用 LLM
    const llmResponse = await manager.chat(
      {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model,
        temperature,
        maxTokens: 4096,
      },
      provider
    );

    // 解析回答
    const parsedAnswers = parseAnswersFromResponse(llmResponse.content);

    if (!parsedAnswers || !parsedAnswers.answers) {
      return NextResponse.json(
        {
          error: "Failed to parse LLM response",
          rawResponse: llmResponse.content,
        },
        { status: 422 }
      );
    }

    // 构建响应
    const surveyResponse: SurveyResponse = {
      personaId: persona.id,
      answers: parsedAnswers.answers as SurveyAnswer[],
      rawResponse: llmResponse.content,
      processingTime: Date.now() - startTime,
    };

    return NextResponse.json({
      success: true,
      data: surveyResponse,
      meta: {
        provider: llmResponse.provider,
        model: llmResponse.model,
        usage: llmResponse.usage,
        processingTime: surveyResponse.processingTime,
      },
    });
  } catch (error) {
    console.error("Survey execution error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Survey execution failed",
        details: errorMessage,
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
