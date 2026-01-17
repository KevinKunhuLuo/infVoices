/**
 * InfVoices 数据分析器
 *
 * 处理调研结果，生成统计分析
 */

import type { Persona } from "@/lib/supabase";
import type { SurveyQuestion, QuestionType } from "@/lib/survey";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { SurveyAnswer } from "@/lib/llm";
import type {
  AnswerStatistics,
  AnswerDistribution,
  ScaleStatistics,
  DemographicDistribution,
  DemographicDimension,
  DemographicSegment,
  CrossAnalysis,
  CrossAnalysisRow,
  AnalysisReport,
  ReportSummary,
  AnalysisInsight,
  InsightType,
} from "./types";
import { CHART_COLORS, DEMOGRAPHIC_LABELS } from "./types";

/**
 * 生成分析报告
 */
export function generateAnalysisReport(
  surveyId: string,
  surveyTitle: string,
  questions: SurveyQuestion[],
  responses: ResponseEntry[]
): AnalysisReport {
  const completedResponses = responses.filter((r) => r.status === "completed");
  const failedResponses = responses.filter((r) => r.status === "failed");

  // 计算摘要统计
  const summary = calculateSummary(responses);

  // 人口学分布
  const demographics = analyzeDemographics(completedResponses);

  // 问题统计
  const questionStats = questions.map((q) =>
    analyzeQuestion(q, completedResponses)
  );

  // 生成关键洞察
  const insights = generateInsights(questionStats, demographics, summary);

  return {
    surveyId,
    surveyTitle,
    generatedAt: Date.now(),
    summary,
    demographics,
    questions: questionStats,
    insights,
  };
}

/**
 * 生成关键洞察
 */
function generateInsights(
  questionStats: (AnswerStatistics | ScaleStatistics)[],
  demographics: DemographicDistribution[],
  summary: ReportSummary
): AnalysisInsight[] {
  const insights: AnalysisInsight[] = [];

  // 1. 分析选择题的主导选项
  questionStats.forEach((stat) => {
    if (
      stat.questionType === "single_choice" ||
      stat.questionType === "multiple_choice"
    ) {
      const sorted = [...stat.distribution].sort((a, b) => b.percentage - a.percentage);
      if (sorted.length >= 2) {
        const top = sorted[0];
        const second = sorted[1];
        const diff = top.percentage - second.percentage;

        if (diff >= 20) {
          insights.push({
            type: "trend" as InsightType,
            title: `「${top.label}」占据主导地位`,
            description: `在"${stat.questionTitle}"问题中，「${top.label}」以 ${top.percentage.toFixed(1)}% 的占比领先，比第二名高出 ${diff.toFixed(1)} 个百分点，表现出明显的用户偏好。`,
            relatedQuestions: [stat.questionId],
            confidence: Math.min(0.95, 0.7 + diff / 100),
          });
        } else if (diff < 5 && top.percentage > 20) {
          insights.push({
            type: "anomaly" as InsightType,
            title: `选项竞争激烈`,
            description: `在"${stat.questionTitle}"问题中，「${top.label}」(${top.percentage.toFixed(1)}%) 和「${second.label}」(${second.percentage.toFixed(1)}%) 差距较小，用户偏好较为分散。`,
            relatedQuestions: [stat.questionId],
            confidence: 0.75,
          });
        }
      }
    }
  });

  // 2. 分析量表题的满意度
  questionStats.forEach((stat) => {
    if (stat.questionType === "scale" && "mean" in stat) {
      const scaleStats = stat as ScaleStatistics;
      const maxScale = scaleStats.max || 5;
      const midPoint = (maxScale + 1) / 2;

      if (scaleStats.mean >= midPoint + 1) {
        insights.push({
          type: "sentiment" as InsightType,
          title: `高满意度评价`,
          description: `"${stat.questionTitle}"的平均分为 ${scaleStats.mean.toFixed(2)}（满分${maxScale}），整体反馈积极正向。`,
          relatedQuestions: [stat.questionId],
          confidence: 0.85,
        });
      } else if (scaleStats.mean <= midPoint - 0.5) {
        insights.push({
          type: "recommendation" as InsightType,
          title: `需关注的低分项`,
          description: `"${stat.questionTitle}"的平均分为 ${scaleStats.mean.toFixed(2)}（满分${maxScale}），低于中位值，可能需要改进。`,
          relatedQuestions: [stat.questionId],
          confidence: 0.8,
        });
      }

      // 分析标准差（意见一致性）
      if (scaleStats.standardDeviation < 0.8) {
        insights.push({
          type: "correlation" as InsightType,
          title: `意见高度一致`,
          description: `"${stat.questionTitle}"的标准差仅为 ${scaleStats.standardDeviation.toFixed(2)}，表明受访者意见较为一致。`,
          relatedQuestions: [stat.questionId],
          confidence: 0.9,
        });
      } else if (scaleStats.standardDeviation > 1.5) {
        insights.push({
          type: "demographic_difference" as InsightType,
          title: `意见分歧明显`,
          description: `"${stat.questionTitle}"的标准差达到 ${scaleStats.standardDeviation.toFixed(2)}，表明不同人群有不同看法，建议做进一步细分分析。`,
          relatedQuestions: [stat.questionId],
          confidence: 0.85,
        });
      }
    }
  });

  // 3. 分析人口学分布特征
  demographics.forEach((demo) => {
    if (demo.segments.length >= 2) {
      const sorted = [...demo.segments].sort((a, b) => b.percentage - a.percentage);
      const top = sorted[0];

      if (top.percentage >= 40) {
        insights.push({
          type: "demographic_difference" as InsightType,
          title: `${demo.label}分布集中`,
          description: `样本中「${top.label}」占比 ${top.percentage.toFixed(1)}%，${demo.label}分布相对集中。`,
          confidence: 0.8,
        });
      }
    }
  });

  // 4. 置信度洞察
  if (summary.averageConfidence >= 0.85) {
    insights.push({
      type: "trend" as InsightType,
      title: `回答置信度高`,
      description: `整体回答置信度达到 ${(summary.averageConfidence * 100).toFixed(0)}%，AI 模拟的用户回答具有较高可信度。`,
      confidence: summary.averageConfidence,
    });
  } else if (summary.averageConfidence < 0.6) {
    insights.push({
      type: "recommendation" as InsightType,
      title: `置信度偏低`,
      description: `整体回答置信度为 ${(summary.averageConfidence * 100).toFixed(0)}%，部分问题可能设计不够清晰，建议优化问卷。`,
      confidence: 0.7,
    });
  }

  // 限制最多返回6条洞察
  return insights.slice(0, 6);
}

/**
 * 计算报告摘要
 */
function calculateSummary(responses: ResponseEntry[]): ReportSummary {
  const total = responses.length;
  const completed = responses.filter((r) => r.status === "completed").length;
  const failed = responses.filter((r) => r.status === "failed").length;

  // 计算平均响应时间
  const responseTimes = responses
    .filter((r) => r.startTime && r.endTime)
    .map((r) => r.endTime! - r.startTime!);

  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

  // 计算平均置信度
  const confidences: number[] = [];
  responses.forEach((r) => {
    if (r.response?.answers) {
      r.response.answers.forEach((a) => {
        if (a.confidence) {
          confidences.push(a.confidence);
        }
      });
    }
  });

  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

  return {
    totalResponses: total,
    completedResponses: completed,
    failedResponses: failed,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    averageResponseTime: avgResponseTime,
    averageConfidence: avgConfidence,
  };
}

/**
 * 分析人口学分布
 */
function analyzeDemographics(
  responses: ResponseEntry[]
): DemographicDistribution[] {
  const dimensions: DemographicDimension[] = [
    "gender",
    "ageRange",
    "cityTier",
    "education",
    "incomeLevel",
    "occupation",
    "familyStatus",
    "region",
  ];

  return dimensions.map((dimension) => {
    const counts: Record<string, number> = {};
    const total = responses.length;

    responses.forEach((r) => {
      const value = r.persona[dimension] as string;
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    const segments: DemographicSegment[] = Object.entries(counts)
      .map(([value, count], index) => ({
        value,
        label: value,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
      }))
      .sort((a, b) => b.count - a.count);

    return {
      dimension,
      label: DEMOGRAPHIC_LABELS[dimension],
      segments,
    };
  });
}

/**
 * 分析单个问题的答案
 */
function analyzeQuestion(
  question: SurveyQuestion,
  responses: ResponseEntry[]
): AnswerStatistics | ScaleStatistics {
  const answers = extractAnswersForQuestion(question.id, responses);
  const validAnswers = answers.filter((a) => a !== null && a !== undefined);

  const baseStats: AnswerStatistics = {
    questionId: question.id,
    questionTitle: question.title,
    questionType: question.type,
    totalResponses: responses.length,
    validResponses: validAnswers.length,
    distribution: [],
    averageConfidence: calculateAverageConfidence(question.id, responses),
  };

  switch (question.type) {
    case "single_choice":
    case "multiple_choice":
      return analyzeChoiceQuestion(question, validAnswers, baseStats);
    case "scale":
      return analyzeScaleQuestion(question, validAnswers, baseStats);
    case "open_text":
      return analyzeOpenTextQuestion(question, validAnswers, baseStats);
    case "image_compare":
      return analyzeImageCompareQuestion(question, validAnswers, baseStats);
    case "concept_test":
      return analyzeConceptTestQuestion(question, validAnswers, baseStats);
    default:
      return baseStats;
  }
}

/**
 * 提取问题的所有答案
 */
function extractAnswersForQuestion(
  questionId: string,
  responses: ResponseEntry[]
): unknown[] {
  return responses
    .filter((r) => r.response?.answers)
    .map((r) => {
      const answer = r.response!.answers.find((a) => a.questionId === questionId);
      return answer?.answer;
    });
}

/**
 * 计算平均置信度
 */
function calculateAverageConfidence(
  questionId: string,
  responses: ResponseEntry[]
): number {
  const confidences: number[] = [];

  responses.forEach((r) => {
    if (r.response?.answers) {
      const answer = r.response.answers.find((a) => a.questionId === questionId);
      if (answer?.confidence) {
        confidences.push(answer.confidence);
      }
    }
  });

  return confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;
}

/**
 * 分析选择题
 */
function analyzeChoiceQuestion(
  question: SurveyQuestion,
  answers: unknown[],
  baseStats: AnswerStatistics
): AnswerStatistics {
  const counts: Record<string, number> = {};
  const total = answers.length;

  // 初始化所有选项
  question.options?.forEach((opt) => {
    counts[opt.value] = 0;
  });

  // 统计答案
  answers.forEach((answer) => {
    if (Array.isArray(answer)) {
      // 多选题
      answer.forEach((v) => {
        if (typeof v === "string") {
          counts[v] = (counts[v] || 0) + 1;
        }
      });
    } else if (typeof answer === "string") {
      // 单选题
      counts[answer] = (counts[answer] || 0) + 1;
    }
  });

  const distribution: AnswerDistribution[] = (question.options || []).map(
    (opt, index) => ({
      value: opt.value,
      label: opt.label,
      count: counts[opt.value] || 0,
      percentage: total > 0 ? ((counts[opt.value] || 0) / total) * 100 : 0,
      color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
    })
  );

  return {
    ...baseStats,
    distribution,
  };
}

/**
 * 分析量表题
 */
function analyzeScaleQuestion(
  question: SurveyQuestion,
  answers: unknown[],
  baseStats: AnswerStatistics
): ScaleStatistics {
  const numericAnswers = answers
    .filter((a) => typeof a === "number")
    .map((a) => a as number);

  const min = question.scaleConfig?.min || 1;
  const max = question.scaleConfig?.max || 5;

  // 生成分布
  const counts: Record<number, number> = {};
  for (let i = min; i <= max; i++) {
    counts[i] = 0;
  }

  numericAnswers.forEach((value) => {
    if (counts[value] !== undefined) {
      counts[value]++;
    }
  });

  const distribution: AnswerDistribution[] = Object.entries(counts).map(
    ([value, count], index) => ({
      value: value.toString(),
      label: getScaleLabel(parseInt(value), min, max, question.scaleConfig),
      count,
      percentage:
        numericAnswers.length > 0 ? (count / numericAnswers.length) * 100 : 0,
      color: CHART_COLORS.scale[index % CHART_COLORS.scale.length],
    })
  );

  // 计算统计量
  const sorted = [...numericAnswers].sort((a, b) => a - b);
  const mean =
    numericAnswers.length > 0
      ? numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length
      : 0;

  const median =
    sorted.length > 0
      ? sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      : 0;

  const mode = findMode(numericAnswers);

  const variance =
    numericAnswers.length > 0
      ? numericAnswers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        numericAnswers.length
      : 0;

  const standardDeviation = Math.sqrt(variance);

  return {
    ...baseStats,
    distribution,
    mean,
    median,
    mode,
    standardDeviation,
    min: Math.min(...numericAnswers, min),
    max: Math.max(...numericAnswers, max),
  };
}

/**
 * 获取量表标签
 */
function getScaleLabel(
  value: number,
  min: number,
  max: number,
  config?: { minLabel?: string; maxLabel?: string }
): string {
  if (value === min && config?.minLabel) {
    return `${value} - ${config.minLabel}`;
  }
  if (value === max && config?.maxLabel) {
    return `${value} - ${config.maxLabel}`;
  }
  return value.toString();
}

/**
 * 计算众数
 */
function findMode(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const counts: Record<number, number> = {};
  let maxCount = 0;
  let mode = numbers[0];

  numbers.forEach((num) => {
    counts[num] = (counts[num] || 0) + 1;
    if (counts[num] > maxCount) {
      maxCount = counts[num];
      mode = num;
    }
  });

  return mode;
}

/**
 * 分析开放文本题
 */
function analyzeOpenTextQuestion(
  question: SurveyQuestion,
  answers: unknown[],
  baseStats: AnswerStatistics
): AnswerStatistics {
  const textAnswers = answers.filter(
    (a) => typeof a === "string" && a.length > 0
  ) as string[];

  // 简单的词频统计
  const wordCounts: Record<string, number> = {};

  textAnswers.forEach((text) => {
    // 分词（简单中文分词）
    const words = text.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
    words.forEach((word) => {
      if (word.length >= 2) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  // 取前10个高频词
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const distribution: AnswerDistribution[] = topWords.map(
    ([word, count], index) => ({
      value: word,
      label: word,
      count,
      percentage: textAnswers.length > 0 ? (count / textAnswers.length) * 100 : 0,
      color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
    })
  );

  return {
    ...baseStats,
    distribution,
  };
}

/**
 * 分析图片对比题
 */
function analyzeImageCompareQuestion(
  question: SurveyQuestion,
  answers: unknown[],
  baseStats: AnswerStatistics
): AnswerStatistics {
  const images = question.images || [];
  const counts: Record<string, number> = {};

  // 使用 url 作为标识符
  images.forEach((img) => {
    counts[img.url] = 0;
  });

  answers.forEach((answer) => {
    if (typeof answer === "string" && counts[answer] !== undefined) {
      counts[answer]++;
    }
  });

  const distribution: AnswerDistribution[] = images.map((img, index) => ({
    value: img.url,
    label: img.caption || img.alt || `图片 ${index + 1}`,
    count: counts[img.url] || 0,
    percentage: answers.length > 0 ? ((counts[img.url] || 0) / answers.length) * 100 : 0,
    color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
  }));

  return {
    ...baseStats,
    distribution,
  };
}

/**
 * 分析概念测试题
 */
function analyzeConceptTestQuestion(
  question: SurveyQuestion,
  answers: unknown[],
  baseStats: AnswerStatistics
): AnswerStatistics {
  const dimensions = question.conceptConfig?.dimensions || [];
  const dimensionScores: Record<string, number[]> = {};

  dimensions.forEach((dim) => {
    dimensionScores[dim.id] = [];
  });

  // 收集每个维度的分数
  answers.forEach((answer) => {
    if (typeof answer === "object" && answer !== null) {
      const answerObj = answer as Record<string, number>;
      Object.entries(answerObj).forEach(([dimId, score]) => {
        if (dimensionScores[dimId] && typeof score === "number") {
          dimensionScores[dimId].push(score);
        }
      });
    }
  });

  // 计算每个维度的平均分
  const distribution: AnswerDistribution[] = dimensions.map((dim, index) => {
    const scores = dimensionScores[dim.id] || [];
    const avgScore =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

    return {
      value: dim.id,
      label: dim.name,
      count: scores.length,
      percentage: avgScore * 20, // 转换为百分比（假设5分制）
      color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
    };
  });

  return {
    ...baseStats,
    distribution,
  };
}

/**
 * 生成交叉分析
 */
export function generateCrossAnalysis(
  question: SurveyQuestion,
  responses: ResponseEntry[],
  dimension: DemographicDimension
): CrossAnalysis {
  const completedResponses = responses.filter((r) => r.status === "completed");

  // 按维度分组
  const groups: Record<string, ResponseEntry[]> = {};

  completedResponses.forEach((r) => {
    const segmentValue = r.persona[dimension] as string;
    if (segmentValue) {
      if (!groups[segmentValue]) {
        groups[segmentValue] = [];
      }
      groups[segmentValue].push(r);
    }
  });

  // 为每个分组计算答案分布
  const data: CrossAnalysisRow[] = Object.entries(groups).map(
    ([segment, groupResponses]) => {
      const answers = extractAnswersForQuestion(
        question.id,
        groupResponses
      ).filter((a) => a !== null && a !== undefined);

      const answerCounts: Record<string, number> = {};

      // 初始化选项计数
      if (question.options) {
        question.options.forEach((opt) => {
          answerCounts[opt.value] = 0;
        });
      }

      // 统计答案
      answers.forEach((answer) => {
        if (Array.isArray(answer)) {
          answer.forEach((v) => {
            if (typeof v === "string") {
              answerCounts[v] = (answerCounts[v] || 0) + 1;
            }
          });
        } else if (typeof answer === "string") {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        }
      });

      const total = answers.length;

      return {
        segment,
        segmentLabel: segment,
        answers: (question.options || []).map((opt) => ({
          value: opt.value,
          label: opt.label,
          count: answerCounts[opt.value] || 0,
          percentage:
            total > 0 ? ((answerCounts[opt.value] || 0) / total) * 100 : 0,
        })),
        total,
      };
    }
  );

  return {
    questionId: question.id,
    questionTitle: question.title,
    dimension,
    dimensionLabel: DEMOGRAPHIC_LABELS[dimension],
    data,
  };
}
