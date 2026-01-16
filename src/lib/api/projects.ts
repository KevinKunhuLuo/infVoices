/**
 * Projects API
 * 调研项目的数据访问层
 */

import { getSupabaseClient } from "@/lib/supabase";
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  AudienceConfig,
  Survey,
  SurveyRun,
} from "@/lib/supabase";

// ============================================
// 项目 CRUD
// ============================================

/**
 * 获取所有项目列表
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }

  return (data || []) as Project[];
}

/**
 * 获取单个项目详情
 */
export async function getProject(id: string): Promise<Project | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching project:", error);
    throw new Error("Failed to fetch project");
  }

  return data as Project;
}

/**
 * 获取项目完整数据（包含人群配置、问卷、运行记录）
 */
export async function getProjectWithDetails(id: string) {
  const supabase = getSupabaseClient();

  const [projectResult, audienceResult, surveyResult, runsResult] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("audience_configs").select("*").eq("project_id", id).single(),
      supabase.from("surveys").select("*").eq("project_id", id).single(),
      supabase
        .from("survey_runs")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (projectResult.error && projectResult.error.code !== "PGRST116") {
    throw new Error("Failed to fetch project");
  }

  return {
    project: projectResult.data as Project | null,
    audienceConfig: audienceResult.data as AudienceConfig | null,
    survey: surveyResult.data as Survey | null,
    runs: (runsResult.data || []) as SurveyRun[],
  };
}

/**
 * 创建新项目
 */
export async function createProject(
  project: ProjectInsert
): Promise<Project> {
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }

  // 同时创建空的人群配置和问卷
  await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("audience_configs").insert({
      project_id: data.id,
      dimensions: {},
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("surveys").insert({
      project_id: data.id,
      questions: [],
    }),
  ]);

  return data as Project;
}

/**
 * 更新项目
 */
export async function updateProject(
  id: string,
  updates: ProjectUpdate
): Promise<Project> {
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }

  return data as Project;
}

/**
 * 删除项目
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
}

// ============================================
// 人群配置
// ============================================

/**
 * 获取项目的人群配置
 */
export async function getAudienceConfig(
  projectId: string
): Promise<AudienceConfig | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("audience_configs")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error("Failed to fetch audience config");
  }

  return data as AudienceConfig;
}

/**
 * 更新人群配置
 */
export async function updateAudienceConfig(
  projectId: string,
  config: Partial<AudienceConfig>
): Promise<AudienceConfig> {
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("audience_configs")
    .update(config)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Error updating audience config:", error);
    throw new Error("Failed to update audience config");
  }

  return data as AudienceConfig;
}

// ============================================
// 问卷
// ============================================

/**
 * 获取项目的问卷
 */
export async function getSurvey(projectId: string): Promise<Survey | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error("Failed to fetch survey");
  }

  return data as Survey;
}

/**
 * 更新问卷
 */
export async function updateSurvey(
  projectId: string,
  survey: Partial<Survey>
): Promise<Survey> {
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("surveys")
    .update(survey)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Error updating survey:", error);
    throw new Error("Failed to update survey");
  }

  return data as Survey;
}

// ============================================
// 项目统计
// ============================================

/**
 * 获取项目统计数据
 */
export async function getProjectStats() {
  const supabase = getSupabaseClient();

  const [projectsResult, responsesResult] = await Promise.all([
    supabase
      .from("projects")
      .select("status", { count: "exact" }),
    supabase
      .from("responses")
      .select("id", { count: "exact" }),
  ]);

  const projects = await getProjects();
  const statusCounts = projects.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalProjects: projects.length,
    totalResponses: responsesResult.count || 0,
    byStatus: statusCounts,
  };
}
