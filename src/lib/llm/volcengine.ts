/**
 * 火山引擎 LLM 客户端
 *
 * 火山引擎豆包大模型 API 实现
 * 文档: https://www.volcengine.com/docs/82379
 */

import type {
  LLMClient,
  LLMRequestParams,
  LLMResponse,
  VolcengineConfig,
  ChatMessage,
} from "./types";

// 默认模型
const DEFAULT_MODEL = "doubao-seed-1-8-251228";

// API 端点
const API_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export class VolcengineClient implements LLMClient {
  provider = "volcengine" as const;
  private config: VolcengineConfig;

  constructor(config: Partial<VolcengineConfig> = {}) {
    this.config = {
      provider: "volcengine",
      apiKey: config.apiKey || process.env.VOLCENGINE_API_KEY || "",
      apiEndpoint: config.apiEndpoint || API_ENDPOINT,
      model: config.model || DEFAULT_MODEL,
      defaultTemperature: config.defaultTemperature ?? 0.7,
      defaultMaxTokens: config.defaultMaxTokens ?? 4096,
    };
  }

  async chat(params: LLMRequestParams): Promise<LLMResponse> {
    const {
      messages,
      model = this.config.model,
      temperature = this.config.defaultTemperature,
      maxTokens = this.config.defaultMaxTokens,
      topP = 0.9,
    } = params;

    const requestBody = {
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
    };

    try {
      const response = await fetch(this.config.apiEndpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Volcengine API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // 解析响应
      const choice = data.choices?.[0];
      if (!choice) {
        throw new Error("Volcengine API returned empty response");
      }

      return {
        content: choice.message?.content || "",
        model: data.model || model,
        provider: "volcengine",
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      console.error("Volcengine API error:", error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }

    try {
      // 简单测试请求
      await this.chat({
        messages: [{ role: "user", content: "ping" }],
        maxTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// 创建默认客户端
export function createVolcengineClient(
  config?: Partial<VolcengineConfig>
): VolcengineClient {
  return new VolcengineClient(config);
}
