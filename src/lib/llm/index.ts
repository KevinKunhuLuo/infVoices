// LLM 模块导出

// 类型
export type {
  LLMProvider,
  MessageRole,
  ChatMessage,
  LLMRequestParams,
  LLMResponse,
  LLMClient,
  LLMConfig,
  VolcengineConfig,
  OpenRouterConfig,
  SurveyAnswer,
  SurveyResponse,
} from "./types";

// 客户端
export { VolcengineClient, createVolcengineClient } from "./volcengine";
export {
  OpenRouterClient,
  createOpenRouterClient,
  OPENROUTER_MODELS,
} from "./openrouter";

// 管理器
export {
  LLMManager,
  getLLMManager,
  resetLLMManager,
  type LLMManagerConfig,
} from "./manager";

// 提示词
export {
  generatePersonaSystemPrompt,
  generateQuestionsPrompt,
  generateSurveyPrompt,
  parseAnswersFromResponse,
} from "./prompts";
