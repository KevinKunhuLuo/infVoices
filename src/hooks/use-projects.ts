"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProject,
  getProjectWithDetails,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} from "@/lib/api/projects";
import type { ProjectInsert, ProjectUpdate } from "@/lib/supabase";

// ============================================
// Query Keys
// ============================================

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  fullDetail: (id: string) => [...projectKeys.details(), id, "full"] as const,
  stats: () => [...projectKeys.all, "stats"] as const,
};

// ============================================
// Queries
// ============================================

/**
 * 获取项目列表
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: getProjects,
  });
}

/**
 * 获取单个项目
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

/**
 * 获取项目完整详情（包含配置和问卷）
 */
export function useProjectWithDetails(id: string) {
  return useQuery({
    queryKey: projectKeys.fullDetail(id),
    queryFn: () => getProjectWithDetails(id),
    enabled: !!id,
  });
}

/**
 * 获取项目统计
 */
export function useProjectStats() {
  return useQuery({
    queryKey: projectKeys.stats(),
    queryFn: getProjectStats,
  });
}

// ============================================
// Mutations
// ============================================

/**
 * 创建项目
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectInsert) => createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

/**
 * 更新项目
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectUpdate }) =>
      updateProject(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.fullDetail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * 删除项目
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}
