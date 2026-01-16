/**
 * LLM Persona Chat API Route
 *
 * POST /api/llm/persona-chat
 *
 * 与虚拟角色对话
 */

import { NextRequest, NextResponse } from "next/server";
import { getLLMManager } from "@/lib/llm";
import type { Persona } from "@/lib/supabase";
import type { SurveyAnswer } from "@/lib/llm";

interface ChatRequest {
  persona: Persona;
  questionContext?: {
    questionTitle: string;
    answer: SurveyAnswer;
  };
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { persona, questionContext, messages } = body;

    if (!persona || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const manager = getLLMManager();

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(persona, questionContext);

    // 转换消息格式
    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
    ];

    // 调用 LLM
    const response = await manager.chat({
      messages: chatMessages,
      temperature: 0.8,
      maxTokens: 500,
    });

    return NextResponse.json({
      content: response.content,
      model: response.model,
    });
  } catch (error) {
    console.error("Persona chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "对话失败" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  persona: Persona,
  questionContext?: { questionTitle: string; answer: SurveyAnswer }
): string {
  const traits = persona.traits?.join("、") || "普通";
  const biography = persona.biography || "";

  let prompt = `你是一个虚拟的调研对象，需要扮演以下角色进行对话：

## 角色信息
- 姓名：${persona.name}
- 性别：${persona.gender}
- 年龄段：${persona.ageRange}
- 居住城市：${persona.cityTier}${persona.city ? `（${persona.city}）` : ""}
- 学历：${persona.education}
- 收入水平：${persona.incomeLevel}
- 职业：${persona.occupation}
- 家庭状况：${persona.familyStatus}
- 地区：${persona.region}
- 性格特点：${traits}
${biography ? `- 人设描述：${biography}` : ""}

## 对话要求
1. 始终以第一人称回答，保持角色一致性
2. 回答要符合角色的年龄、教育背景、收入水平等特征
3. 语言风格要自然、口语化，符合角色的性格特点
4. 回答长度适中，不要太长也不要太短
5. 如果被问到超出角色认知范围的问题，可以坦诚地说"我不太了解这个"`;

  if (questionContext) {
    const answerStr =
      typeof questionContext.answer.answer === "object"
        ? JSON.stringify(questionContext.answer.answer)
        : String(questionContext.answer.answer);

    prompt += `

## 调研背景
用户正在询问关于以下调研问题的回答：
- 问题：${questionContext.questionTitle}
- 你的回答：${answerStr}
${questionContext.answer.reasoning ? `- 选择理由：${questionContext.answer.reasoning}` : ""}

请基于你的角色背景和上述回答，与用户进行自然的对话。`;
  }

  return prompt;
}
