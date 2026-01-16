/**
 * OpenRouter LLM 客户端
 *
 * OpenRouter 提供统一的 API 访问多种模型
 * 文档: https://openrouter.ai/docs
 */

import type {
  LLMClient,
  LLMRequestParams,
  LLMResponse,
  OpenRouterConfig,
} from "./types";

// 默认模型 - 使用 Gemini Flash 1.5 (便宜且快速)
const DEFAULT_MODEL = "google/gemini-flash-1.5";

// API 端点
const API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export class OpenRouterClient implements LLMClient {
  provider = "openrouter" as const;
  private config: OpenRouterConfig;

  constructor(config: Partial<OpenRouterConfig> = {}) {
    this.config = {
      provider: "openrouter",
      apiKey: config.apiKey || process.env.OPENROUTER_API_KEY || "",
      apiEndpoint: config.apiEndpoint || API_ENDPOINT,
      model: config.model || DEFAULT_MODEL,
      defaultTemperature: config.defaultTemperature ?? 0.7,
      defaultMaxTokens: config.defaultMaxTokens ?? 4096,
      siteUrl: config.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://infvoices.app",
      siteName: config.siteName || "InfVoices",
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
          "HTTP-Referer": this.config.siteUrl!,
          "X-Title": this.config.siteName!,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // 解析响应
      const choice = data.choices?.[0];
      if (!choice) {
        throw new Error("OpenRouter API returned empty response");
      }

      return {
        content: choice.message?.content || "",
        model: data.model || model,
        provider: "openrouter",
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
      console.error("OpenRouter API error:", error);
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

// 可用的模型列表
export const OPENROUTER_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek" },
  { id: "qwen/qwen-2-72b-instruct", name: "Qwen 2 72B", provider: "Alibaba" },
];

// 创建默认客户端
export function createOpenRouterClient(
  config?: Partial<OpenRouterConfig>
): OpenRouterClient {
  return new OpenRouterClient(config);
}
