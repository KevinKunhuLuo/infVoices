/**
 * InfVoices Database Types
 *
 * 数据库类型定义 - 与 Supabase 表结构对应
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// 项目状态枚举
// ============================================

export type ProjectStatus = "draft" | "running" | "completed" | "paused";

export type SurveyRunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

// ============================================
// 问卷题型枚举
// ============================================

export type QuestionType =
  | "single_choice"      // 单选题
  | "multiple_choice"    // 多选题
  | "scale"              // 量表打分题
  | "open_text"          // 开放式文字题
  | "image_compare"      // 图片对比题
  | "concept_test";      // 概念测试题

// ============================================
// 维度定义
// ============================================

export interface DimensionConfig {
  ageRange?: string[];           // 年龄段
  gender?: string[];             // 性别
  cityTier?: string[];           // 城市线级
  incomeLevel?: string[];        // 收入水平
  education?: string[];          // 学历
  occupation?: string[];         // 职业类型
  familyStatus?: string[];       // 家庭结构
  region?: string[];             // 地域文化圈
}

export interface WeightConfig {
  [dimension: string]: {
    [value: string]: number;     // 权重值 0-1
  };
}

// ============================================
// 问题配置类型
// ============================================

export interface SingleChoiceConfig {
  options: string[];
  randomize?: boolean;
}

export interface MultipleChoiceConfig {
  options: string[];
  minSelect?: number;
  maxSelect?: number;
  randomize?: boolean;
}

export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface OpenTextConfig {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export interface ImageCompareConfig {
  images: Array<{
    id: string;
    url: string;
    label?: string;
  }>;
  allowMultiple?: boolean;
}

export interface ConceptTestConfig {
  content: string;              // 待测试的文案/概念
  contentType: "text" | "image" | "both";
  imageUrl?: string;
  dimensions: string[];          // 评估维度：吸引力、可信度、购买意愿等
}

export type QuestionConfig =
  | SingleChoiceConfig
  | MultipleChoiceConfig
  | ScaleConfig
  | OpenTextConfig
  | ImageCompareConfig
  | ConceptTestConfig;

// ============================================
// 问题定义
// ============================================

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  config: QuestionConfig;
}

// ============================================
// 角色定义
// ============================================

export interface Persona {
  id: string;
  name: string;
  avatarUrl?: string;
  ageRange: string;
  gender: string;
  cityTier: string;
  city?: string;
  incomeLevel: string;
  education: string;
  occupation: string;
  familyStatus: string;
  region: string;
  traits?: string[];           // 性格特点标签
  biography?: string;          // 简短人设描述
  populationShare?: string;    // 人群占比（格式化字符串，如 "0.5%"）
  populationShareRaw?: number; // 人群占比（原始数值）
}

// ============================================
// 回答定义
// ============================================

export interface Answer {
  questionId: string;
  value: Json;                  // 回答内容（不同题型格式不同）
  reasoning?: string;           // AI 给出的理由
  confidence?: number;          // 置信度 0-1
}

// ============================================
// Database Schema
// ============================================

export interface Database {
  public: {
    Tables: {
      // 调研项目表
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 人群配置表
      audience_configs: {
        Row: {
          id: string;
          project_id: string;
          preset_name: string | null;
          dimensions: DimensionConfig;
          weights: WeightConfig | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          preset_name?: string | null;
          dimensions: DimensionConfig;
          weights?: WeightConfig | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          preset_name?: string | null;
          dimensions?: DimensionConfig;
          weights?: WeightConfig | null;
          created_at?: string;
        };
      };

      // 问卷表
      surveys: {
        Row: {
          id: string;
          project_id: string;
          questions: Question[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          questions: Question[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          questions?: Question[];
          created_at?: string;
          updated_at?: string;
        };
      };

      // 调研运行记录表
      survey_runs: {
        Row: {
          id: string;
          project_id: string;
          sample_size: number;
          sampling_mode: string;
          status: SurveyRunStatus;
          progress: number;
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sample_size: number;
          sampling_mode: string;
          status?: SurveyRunStatus;
          progress?: number;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sample_size?: number;
          sampling_mode?: string;
          status?: SurveyRunStatus;
          progress?: number;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };

      // 角色回答表
      responses: {
        Row: {
          id: string;
          run_id: string;
          persona: Persona;
          answers: Answer[];
          raw_llm_response: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          persona: Persona;
          answers: Answer[];
          raw_llm_response?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          persona?: Persona;
          answers?: Answer[];
          raw_llm_response?: string | null;
          created_at?: string;
        };
      };

      // 上传文件表
      uploaded_files: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          file_path: string;
          file_type: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_name: string;
          file_path: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: ProjectStatus;
      survey_run_status: SurveyRunStatus;
      question_type: QuestionType;
    };
  };
}

// ============================================
// 便捷类型别名
// ============================================

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type AudienceConfig = Database["public"]["Tables"]["audience_configs"]["Row"];
export type Survey = Database["public"]["Tables"]["surveys"]["Row"];
export type SurveyRun = Database["public"]["Tables"]["survey_runs"]["Row"];
export type Response = Database["public"]["Tables"]["responses"]["Row"];
export type UploadedFile = Database["public"]["Tables"]["uploaded_files"]["Row"];
