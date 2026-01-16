/**
 * InfVoices LLM 类型定义
 */

// LLM 提供商
export type LLMProvider = "volcengine" | "openrouter";

// 消息角色
export type MessageRole = "system" | "user" | "assistant";

// 聊天消息
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// LLM 请求参数
export interface LLMRequestParams {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

// LLM 响应
export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// LLM 客户端接口
export interface LLMClient {
  provider: LLMProvider;
  chat(params: LLMRequestParams): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
}

// LLM 配置
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  apiEndpoint?: string;
  model: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}

// 火山引擎配置
export interface VolcengineConfig extends LLMConfig {
  provider: "volcengine";
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
}

// OpenRouter 配置
export interface OpenRouterConfig extends LLMConfig {
  provider: "openrouter";
  siteUrl?: string;
  siteName?: string;
}

// 调研回答结构
export interface SurveyAnswer {
  questionId: string;
  questionType: string;
  answer: unknown;
  reasoning: string;
  confidence: number;
}

// 调研响应结构
export interface SurveyResponse {
  personaId: string;
  answers: SurveyAnswer[];
  rawResponse: string;
  processingTime: number;
}
