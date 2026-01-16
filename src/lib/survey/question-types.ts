/**
 * InfVoices 问卷题型定义
 * 支持6种题型：单选、多选、量表、开放文本、图片对比、概念测试
 */

// 题型枚举
export type QuestionType =
  | "single_choice"    // 单选题
  | "multiple_choice"  // 多选题
  | "scale"           // 量表题
  | "open_text"       // 开放文本
  | "image_compare"   // 图片对比
  | "concept_test";   // 概念测试

// 题型配置
export interface QuestionTypeConfig {
  type: QuestionType;
  name: string;
  description: string;
  icon: string;
  color: string;
  hasOptions: boolean;
  hasImages: boolean;
  hasScale: boolean;
}

// 题型配置映射
export const questionTypeConfigs: Record<QuestionType, QuestionTypeConfig> = {
  single_choice: {
    type: "single_choice",
    name: "单选题",
    description: "从多个选项中选择一个答案",
    icon: "circle-dot",
    color: "bg-blue-500",
    hasOptions: true,
    hasImages: false,
    hasScale: false,
  },
  multiple_choice: {
    type: "multiple_choice",
    name: "多选题",
    description: "从多个选项中选择一个或多个答案",
    icon: "check-square",
    color: "bg-purple-500",
    hasOptions: true,
    hasImages: false,
    hasScale: false,
  },
  scale: {
    type: "scale",
    name: "量表题",
    description: "在数值范围内进行打分或评级",
    icon: "sliders-horizontal",
    color: "bg-amber-500",
    hasOptions: false,
    hasImages: false,
    hasScale: true,
  },
  open_text: {
    type: "open_text",
    name: "开放文本",
    description: "自由输入文字回答",
    icon: "text",
    color: "bg-emerald-500",
    hasOptions: false,
    hasImages: false,
    hasScale: false,
  },
  image_compare: {
    type: "image_compare",
    name: "图片对比",
    description: "对比多张图片并做出选择",
    icon: "images",
    color: "bg-rose-500",
    hasOptions: false,
    hasImages: true,
    hasScale: false,
  },
  concept_test: {
    type: "concept_test",
    name: "概念测试",
    description: "展示产品概念并收集多维度反馈",
    icon: "lightbulb",
    color: "bg-cyan-500",
    hasOptions: true,
    hasImages: true,
    hasScale: true,
  },
};

// 选项接口
export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  imageUrl?: string;
}

// 量表配置
export interface ScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

// 图片配置
export interface ImageConfig {
  url: string;
  alt?: string;
  caption?: string;
}

// 概念测试维度
export interface ConceptDimension {
  id: string;
  name: string;
  type: "scale" | "single_choice";
  scaleConfig?: ScaleConfig;
  options?: QuestionOption[];
}

// 概念测试配置
export interface ConceptTestConfig {
  conceptImage?: ImageConfig;
  conceptDescription?: string;
  dimensions: ConceptDimension[];
}

// 问题接口
export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;

  // 选项题配置
  options?: QuestionOption[];

  // 量表题配置
  scaleConfig?: ScaleConfig;

  // 图片对比配置
  images?: ImageConfig[];

  // 概念测试配置
  conceptConfig?: ConceptTestConfig;

  // 逻辑跳转
  skipLogic?: SkipLogic[];
}

// 跳转逻辑
export interface SkipLogic {
  condition: {
    questionId: string;
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
    value: string | number;
  };
  action: "skip_to" | "end_survey";
  targetQuestionId?: string;
}

// 问卷接口
export interface Survey {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  settings: SurveySettings;
  createdAt: string;
  updatedAt: string;
}

// 问卷设置
export interface SurveySettings {
  showProgressBar: boolean;
  allowBackNavigation: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  requireAllQuestions: boolean;
}

// 默认问卷设置
export const defaultSurveySettings: SurveySettings = {
  showProgressBar: true,
  allowBackNavigation: true,
  randomizeQuestions: false,
  randomizeOptions: false,
  requireAllQuestions: false,
};

// 创建新问题
export function createQuestion(type: QuestionType, order: number): SurveyQuestion {
  const baseQuestion: SurveyQuestion = {
    id: crypto.randomUUID(),
    type,
    title: "",
    required: false,
    order,
  };

  switch (type) {
    case "single_choice":
    case "multiple_choice":
      return {
        ...baseQuestion,
        options: [
          { id: crypto.randomUUID(), label: "选项 1", value: "option_1" },
          { id: crypto.randomUUID(), label: "选项 2", value: "option_2" },
        ],
      };

    case "scale":
      return {
        ...baseQuestion,
        scaleConfig: {
          min: 1,
          max: 5,
          minLabel: "非常不满意",
          maxLabel: "非常满意",
          step: 1,
        },
      };

    case "open_text":
      return baseQuestion;

    case "image_compare":
      return {
        ...baseQuestion,
        images: [],
      };

    case "concept_test":
      return {
        ...baseQuestion,
        conceptConfig: {
          dimensions: [
            {
              id: crypto.randomUUID(),
              name: "整体喜好度",
              type: "scale",
              scaleConfig: { min: 1, max: 5, minLabel: "非常不喜欢", maxLabel: "非常喜欢" },
            },
            {
              id: crypto.randomUUID(),
              name: "购买意愿",
              type: "scale",
              scaleConfig: { min: 1, max: 5, minLabel: "肯定不会", maxLabel: "肯定会" },
            },
          ],
        },
      };

    default:
      return baseQuestion;
  }
}

// 验证问题
export function validateQuestion(question: SurveyQuestion): string[] {
  const errors: string[] = [];

  if (!question.title.trim()) {
    errors.push("题目标题不能为空");
  }

  switch (question.type) {
    case "single_choice":
    case "multiple_choice":
      if (!question.options || question.options.length < 2) {
        errors.push("选项题至少需要2个选项");
      }
      if (question.options?.some(opt => !opt.label.trim())) {
        errors.push("所有选项都需要填写内容");
      }
      break;

    case "scale":
      if (!question.scaleConfig) {
        errors.push("量表题需要配置评分范围");
      } else {
        if (question.scaleConfig.min >= question.scaleConfig.max) {
          errors.push("量表最小值必须小于最大值");
        }
      }
      break;

    case "image_compare":
      if (!question.images || question.images.length < 2) {
        errors.push("图片对比题至少需要2张图片");
      }
      break;

    case "concept_test":
      if (!question.conceptConfig) {
        errors.push("概念测试需要配置评估维度");
      } else if (question.conceptConfig.dimensions.length < 1) {
        errors.push("概念测试至少需要1个评估维度");
      }
      break;
  }

  return errors;
}

// 验证问卷
export function validateSurvey(survey: Survey): string[] {
  const errors: string[] = [];

  if (!survey.title.trim()) {
    errors.push("问卷标题不能为空");
  }

  if (survey.questions.length === 0) {
    errors.push("问卷至少需要1道题目");
  }

  survey.questions.forEach((question, index) => {
    const questionErrors = validateQuestion(question);
    questionErrors.forEach(error => {
      errors.push(`第 ${index + 1} 题: ${error}`);
    });
  });

  return errors;
}
