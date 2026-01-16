/**
 * LLM 管理器
 *
 * 统一管理多个 LLM 提供商，支持自动故障转移
 */

import type {
  LLMClient,
  LLMProvider,
  LLMRequestParams,
  LLMResponse,
} from "./types";
import { VolcengineClient } from "./volcengine";
import { OpenRouterClient } from "./openrouter";

export interface LLMManagerConfig {
  primaryProvider: LLMProvider;
  fallbackProvider?: LLMProvider;
  volcengineApiKey?: string;
  volcengineModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  enableFallback?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export class LLMManager {
  private clients: Map<LLMProvider, LLMClient> = new Map();
  private config: LLMManagerConfig;

  constructor(config: LLMManagerConfig) {
    this.config = {
      enableFallback: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    // 初始化客户端
    this.initClients();
  }

  private initClients() {
    // 火山引擎客户端
    if (this.config.volcengineApiKey) {
      this.clients.set(
        "volcengine",
        new VolcengineClient({
          apiKey: this.config.volcengineApiKey,
          model: this.config.volcengineModel,
        })
      );
    }

    // OpenRouter 客户端
    if (this.config.openrouterApiKey) {
      this.clients.set(
        "openrouter",
        new OpenRouterClient({
          apiKey: this.config.openrouterApiKey,
          model: this.config.openrouterModel,
        })
      );
    }
  }

  /**
   * 获取指定提供商的客户端
   */
  getClient(provider: LLMProvider): LLMClient | undefined {
    return this.clients.get(provider);
  }

  /**
   * 获取主要提供商客户端
   */
  getPrimaryClient(): LLMClient | undefined {
    return this.clients.get(this.config.primaryProvider);
  }

  /**
   * 获取备用提供商客户端
   */
  getFallbackClient(): LLMClient | undefined {
    if (this.config.fallbackProvider) {
      return this.clients.get(this.config.fallbackProvider);
    }
    return undefined;
  }

  /**
   * 发送聊天请求，支持自动故障转移
   */
  async chat(
    params: LLMRequestParams,
    preferredProvider?: LLMProvider
  ): Promise<LLMResponse> {
    const provider = preferredProvider || this.config.primaryProvider;
    const client = this.clients.get(provider);

    if (!client) {
      throw new Error(`LLM provider ${provider} is not configured`);
    }

    let lastError: Error | null = null;
    let attempts = 0;

    // 尝试主要提供商
    while (attempts < this.config.maxRetries!) {
      try {
        return await client.chat(params);
      } catch (error) {
        lastError = error as Error;
        attempts++;
        console.warn(
          `LLM request failed (attempt ${attempts}/${this.config.maxRetries}):`,
          error
        );

        if (attempts < this.config.maxRetries!) {
          await this.delay(this.config.retryDelay! * attempts);
        }
      }
    }

    // 尝试故障转移到备用提供商
    if (this.config.enableFallback && this.config.fallbackProvider) {
      const fallbackClient = this.clients.get(this.config.fallbackProvider);
      if (fallbackClient) {
        console.log(
          `Falling back to ${this.config.fallbackProvider} after ${provider} failure`
        );
        try {
          return await fallbackClient.chat(params);
        } catch (fallbackError) {
          console.error("Fallback provider also failed:", fallbackError);
        }
      }
    }

    throw lastError || new Error("All LLM providers failed");
  }

  /**
   * 检查提供商可用性
   */
  async checkAvailability(): Promise<Record<LLMProvider, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [provider, client] of this.clients) {
      results[provider] = await client.isAvailable();
    }

    return results as Record<LLMProvider, boolean>;
  }

  /**
   * 获取已配置的提供商列表
   */
  getConfiguredProviders(): LLMProvider[] {
    return Array.from(this.clients.keys());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 单例管理器
let managerInstance: LLMManager | null = null;

/**
 * 获取或创建 LLM 管理器实例
 */
export function getLLMManager(config?: Partial<LLMManagerConfig>): LLMManager {
  if (!managerInstance || config) {
    managerInstance = new LLMManager({
      primaryProvider: "openrouter",
      fallbackProvider: "volcengine",
      volcengineApiKey: process.env.VOLCENGINE_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      openrouterModel: process.env.OPENROUTER_MODEL,
      ...config,
    });
  }
  return managerInstance;
}

/**
 * 重置管理器实例（用于测试或重新配置）
 */
export function resetLLMManager(): void {
  managerInstance = null;
}
