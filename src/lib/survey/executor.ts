/**
 * InfVoices 调研执行引擎
 *
 * 管理批量调研的执行、进度跟踪和结果收集
 */

import type { Persona } from "@/lib/supabase";
import type { SurveyQuestion } from "@/lib/survey";
import type { SurveyResponse, SurveyAnswer, LLMProvider } from "@/lib/llm";

// 执行状态
export type ExecutionStatus =
  | "idle"
  | "preparing"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

// 单个响应的状态
export type ResponseStatus = "pending" | "running" | "completed" | "failed";

// 响应条目
export interface ResponseEntry {
  id: string;
  persona: Persona;
  status: ResponseStatus;
  response?: SurveyResponse;
  error?: string;
  startTime?: number;
  endTime?: number;
}

// 执行进度
export interface ExecutionProgress {
  total: number;
  completed: number;
  failed: number;
  running: number;
  pending: number;
  percentage: number;
  estimatedTimeRemaining?: number;
  averageResponseTime?: number;
}

// 执行配置
export interface ExecutionConfig {
  concurrency: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
}

// 默认配置
export const DEFAULT_EXECUTION_CONFIG: ExecutionConfig = {
  concurrency: 5,
  retryAttempts: 2,
  retryDelay: 2000,
  timeout: 60000,
  temperature: 0.7,
};

// 执行事件
export type ExecutionEvent =
  | { type: "start"; totalCount: number }
  | { type: "progress"; progress: ExecutionProgress }
  | { type: "response_start"; entry: ResponseEntry }
  | { type: "response_complete"; entry: ResponseEntry }
  | { type: "response_error"; entry: ResponseEntry; error: string }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "complete"; results: ResponseEntry[] }
  | { type: "error"; error: string }
  | { type: "cancel" };

// 事件监听器
export type ExecutionEventListener = (event: ExecutionEvent) => void;

/**
 * 调研执行器类
 */
export class SurveyExecutor {
  private status: ExecutionStatus = "idle";
  private config: ExecutionConfig;
  private questions: SurveyQuestion[] = [];
  private personas: Persona[] = [];
  private responses: ResponseEntry[] = [];
  private listeners: ExecutionEventListener[] = [];
  private abortController: AbortController | null = null;
  private isPaused: boolean = false;
  private responseTimes: number[] = [];

  constructor(config: Partial<ExecutionConfig> = {}) {
    this.config = { ...DEFAULT_EXECUTION_CONFIG, ...config };
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: ExecutionEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * 触发事件
   */
  private emit(event: ExecutionEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * 获取当前状态
   */
  getStatus(): ExecutionStatus {
    return this.status;
  }

  /**
   * 获取执行进度
   */
  getProgress(): ExecutionProgress {
    const total = this.responses.length;
    const completed = this.responses.filter((r) => r.status === "completed").length;
    const failed = this.responses.filter((r) => r.status === "failed").length;
    const running = this.responses.filter((r) => r.status === "running").length;
    const pending = this.responses.filter((r) => r.status === "pending").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 计算平均响应时间和预估剩余时间
    let averageResponseTime: number | undefined;
    let estimatedTimeRemaining: number | undefined;

    if (this.responseTimes.length > 0) {
      averageResponseTime =
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
      estimatedTimeRemaining = averageResponseTime * (pending + running);
    }

    return {
      total,
      completed,
      failed,
      running,
      pending,
      percentage,
      estimatedTimeRemaining,
      averageResponseTime,
    };
  }

  /**
   * 获取所有响应
   */
  getResponses(): ResponseEntry[] {
    return [...this.responses];
  }

  /**
   * 开始执行调研
   */
  async execute(
    personas: Persona[],
    questions: SurveyQuestion[]
  ): Promise<ResponseEntry[]> {
    console.log("Executor.execute called", { personas: personas.length, questions: questions.length, status: this.status });

    if (this.status === "running") {
      throw new Error("Executor is already running");
    }

    this.status = "preparing";
    this.questions = questions;
    this.personas = personas;
    this.responses = personas.map((persona) => ({
      id: crypto.randomUUID(),
      persona,
      status: "pending" as ResponseStatus,
    }));
    this.responseTimes = [];
    this.abortController = new AbortController();
    this.isPaused = false;

    this.emit({ type: "start", totalCount: personas.length });

    this.status = "running";

    try {
      // 并发执行
      await this.executeWithConcurrency();

      this.status = "completed";
      this.emit({ type: "complete", results: this.responses });

      return this.responses;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        this.status = "cancelled";
        this.emit({ type: "cancel" });
      } else {
        this.status = "failed";
        this.emit({ type: "error", error: (error as Error).message });
      }
      throw error;
    }
  }

  /**
   * 并发执行控制
   */
  private async executeWithConcurrency(): Promise<void> {
    const queue = [...this.responses];
    const executing: Promise<void>[] = [];

    while (queue.length > 0 || executing.length > 0) {
      // 检查是否已取消
      if (this.abortController?.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      // 等待暂停恢复
      while (this.isPaused) {
        await this.delay(100);
        if (this.abortController?.signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
      }

      // 填充执行队列
      while (queue.length > 0 && executing.length < this.config.concurrency) {
        const entry = queue.shift()!;
        const promise = this.executeOne(entry).finally(() => {
          const index = executing.indexOf(promise);
          if (index > -1) {
            executing.splice(index, 1);
          }
        });
        executing.push(promise);
      }

      // 等待至少一个完成
      if (executing.length > 0) {
        await Promise.race(executing);
      }
    }
  }

  /**
   * 执行单个调研
   */
  private async executeOne(entry: ResponseEntry): Promise<void> {
    entry.status = "running";
    entry.startTime = Date.now();
    this.emit({ type: "response_start", entry });
    this.emitProgress();

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= this.config.retryAttempts) {
      try {
        const response = await this.callAPI(entry.persona);

        entry.status = "completed";
        entry.response = response;
        entry.endTime = Date.now();

        // 记录响应时间
        const responseTime = entry.endTime - entry.startTime!;
        this.responseTimes.push(responseTime);

        this.emit({ type: "response_complete", entry });
        this.emitProgress();
        return;
      } catch (error) {
        lastError = error as Error;
        attempts++;
        console.error(`API call failed for ${entry.persona.name} (attempt ${attempts}):`, lastError.message);

        if (attempts <= this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempts);
        }
      }
    }

    // 所有重试都失败
    entry.status = "failed";
    entry.error = lastError?.message || "Unknown error";
    entry.endTime = Date.now();

    this.emit({
      type: "response_error",
      entry,
      error: entry.error,
    });
    this.emitProgress();
  }

  /**
   * 调用 API 执行调研
   */
  private async callAPI(persona: Persona): Promise<SurveyResponse> {
    console.log("callAPI called for persona:", persona.name);
    const controller = new AbortController();

    // 超时处理
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    try {
      console.log("Fetching /api/survey/execute for", persona.name);
      const response = await fetch("/api/survey/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          questions: this.questions,
          provider: this.config.provider,
          model: this.config.model,
          temperature: this.config.temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("API response data:", data.success);

      if (!data.success) {
        throw new Error(data.error || "API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Fetch error:", error);
      throw error;
    }
  }

  /**
   * 发送进度更新
   */
  private emitProgress() {
    this.emit({ type: "progress", progress: this.getProgress() });
  }

  /**
   * 暂停执行
   */
  pause(): void {
    if (this.status === "running") {
      this.isPaused = true;
      this.status = "paused";
      this.emit({ type: "pause" });
    }
  }

  /**
   * 恢复执行
   */
  resume(): void {
    if (this.status === "paused") {
      this.isPaused = false;
      this.status = "running";
      this.emit({ type: "resume" });
    }
  }

  /**
   * 取消执行
   */
  cancel(): void {
    if (this.status === "running" || this.status === "paused") {
      this.abortController?.abort();
    }
  }

  /**
   * 重置执行器
   */
  reset(): void {
    this.cancel();
    this.status = "idle";
    this.questions = [];
    this.personas = [];
    this.responses = [];
    this.responseTimes = [];
    this.abortController = null;
    this.isPaused = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 创建执行器实例
 */
export function createSurveyExecutor(
  config?: Partial<ExecutionConfig>
): SurveyExecutor {
  return new SurveyExecutor(config);
}
