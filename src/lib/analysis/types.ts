/**
 * InfVoices 数据分析类型定义
 *
 * 定义调研结果分析所需的所有类型
 */

import type { SurveyQuestion, QuestionType } from "@/lib/survey";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { SurveyAnswer } from "@/lib/llm";

// 答案统计
export interface AnswerStatistics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  totalResponses: number;
  validResponses: number;
  distribution: AnswerDistribution[];
  averageConfidence: number;
}

// 答案分布
export interface AnswerDistribution {
  value: string;
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

// 量表题统计
export interface ScaleStatistics extends AnswerStatistics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  min: number;
  max: number;
}

// 人口学分布
export interface DemographicDistribution {
  dimension: DemographicDimension;
  label: string;
  segments: DemographicSegment[];
}

export type DemographicDimension =
  | "gender"
  | "ageRange"
  | "cityTier"
  | "education"
  | "incomeLevel"
  | "occupation"
  | "familyStatus"
  | "region";

export interface DemographicSegment {
  value: string;
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

// 交叉分析
export interface CrossAnalysis {
  questionId: string;
  questionTitle: string;
  dimension: DemographicDimension;
  dimensionLabel: string;
  data: CrossAnalysisRow[];
}

export interface CrossAnalysisRow {
  segment: string;
  segmentLabel: string;
  answers: {
    value: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  total: number;
}

// 情感分析
export interface SentimentAnalysis {
  questionId: string;
  positive: number;
  neutral: number;
  negative: number;
  keywords: KeywordFrequency[];
}

export interface KeywordFrequency {
  word: string;
  count: number;
  sentiment: "positive" | "neutral" | "negative";
}

// 概念测试分析
export interface ConceptTestAnalysis {
  questionId: string;
  questionTitle: string;
  dimensions: ConceptDimensionResult[];
  overallScore: number;
}

export interface ConceptDimensionResult {
  dimension: string;
  label: string;
  scores: number[];
  mean: number;
  median: number;
  standardDeviation: number;
}

// 完整分析报告
export interface AnalysisReport {
  surveyId: string;
  surveyTitle: string;
  generatedAt: number;
  summary: ReportSummary;
  demographics: DemographicDistribution[];
  questions: AnswerStatistics[];
  crossAnalysis?: CrossAnalysis[];
  insights?: AnalysisInsight[];
}

// 报告摘要
export interface ReportSummary {
  totalResponses: number;
  completedResponses: number;
  failedResponses: number;
  completionRate: number;
  averageResponseTime: number;
  averageConfidence: number;
}

// 洞察
export interface AnalysisInsight {
  type: InsightType;
  title: string;
  description: string;
  relatedQuestions?: string[];
  confidence: number;
}

export type InsightType =
  | "trend"
  | "anomaly"
  | "correlation"
  | "demographic_difference"
  | "sentiment"
  | "recommendation";

// 图表配置
export interface ChartConfig {
  type: ChartType;
  title: string;
  data: unknown[];
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  animate?: boolean;
}

export type ChartType =
  | "pie"
  | "bar"
  | "horizontal_bar"
  | "line"
  | "area"
  | "radar"
  | "scatter"
  | "heatmap";

// 图表颜色方案
export const CHART_COLORS = {
  primary: [
    "oklch(70% 0.15 280)",  // 紫色
    "oklch(70% 0.15 230)",  // 蓝色
    "oklch(70% 0.15 180)",  // 青色
    "oklch(70% 0.15 150)",  // 绿色
    "oklch(70% 0.15 90)",   // 黄色
    "oklch(70% 0.15 30)",   // 橙色
    "oklch(70% 0.15 0)",    // 红色
    "oklch(70% 0.15 330)",  // 粉色
  ],
  gender: {
    男: "oklch(65% 0.15 230)",
    女: "oklch(65% 0.15 350)",
    其他: "oklch(65% 0.05 280)",
  },
  sentiment: {
    positive: "oklch(70% 0.15 150)",
    neutral: "oklch(70% 0.05 280)",
    negative: "oklch(70% 0.15 25)",
  },
  scale: [
    "oklch(55% 0.15 25)",   // 1 - 非常不满意
    "oklch(65% 0.12 50)",   // 2
    "oklch(75% 0.08 90)",   // 3 - 中立
    "oklch(70% 0.12 130)",  // 4
    "oklch(65% 0.15 150)",  // 5 - 非常满意
  ],
};

// 人口学维度标签
export const DEMOGRAPHIC_LABELS: Record<DemographicDimension, string> = {
  gender: "性别",
  ageRange: "年龄段",
  cityTier: "城市层级",
  education: "教育程度",
  incomeLevel: "收入水平",
  occupation: "职业类型",
  familyStatus: "家庭状况",
  region: "地区",
};
