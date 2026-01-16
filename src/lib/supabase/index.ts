// Supabase client exports
export { createClient, getSupabaseClient } from "./client";
export { createServerSupabaseClient } from "./server";

// Type exports
export type {
  Database,
  Project,
  ProjectInsert,
  ProjectUpdate,
  AudienceConfig,
  Survey,
  SurveyRun,
  Response,
  UploadedFile,
  Question,
  QuestionType,
  QuestionConfig,
  Persona,
  Answer,
  DimensionConfig,
  WeightConfig,
  ProjectStatus,
  SurveyRunStatus,
} from "./types";
