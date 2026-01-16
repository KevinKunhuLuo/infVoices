/**
 * 调研执行器 Hook
 *
 * 提供调研执行的状态管理和操作接口
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  SurveyExecutor,
  createSurveyExecutor,
  type ExecutionStatus,
  type ExecutionProgress,
  type ResponseEntry,
  type ExecutionConfig,
  type ExecutionEvent,
} from "@/lib/survey/executor";
import type { Persona } from "@/lib/supabase";
import type { SurveyQuestion } from "@/lib/survey";

export interface UseSurveyExecutorOptions {
  config?: Partial<ExecutionConfig>;
  onEvent?: (event: ExecutionEvent) => void;
}

export interface UseSurveyExecutorReturn {
  // 状态
  status: ExecutionStatus;
  progress: ExecutionProgress;
  responses: ResponseEntry[];
  error: string | null;

  // 操作
  execute: (personas: Persona[], questions: SurveyQuestion[]) => Promise<ResponseEntry[]>;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  reset: () => void;
}

export function useSurveyExecutor(
  options: UseSurveyExecutorOptions = {}
): UseSurveyExecutorReturn {
  const { config, onEvent } = options;

  // 使用 ref 存储选项，避免触发重新创建
  const configRef = useRef(config);
  const onEventRef = useRef(onEvent);
  const executorRef = useRef<SurveyExecutor | null>(null);
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  // 更新 refs
  configRef.current = config;
  onEventRef.current = onEvent;

  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [progress, setProgress] = useState<ExecutionProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    pending: 0,
    percentage: 0,
  });
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 初始化执行器 - 只在首次挂载时创建
  useEffect(() => {
    executorRef.current = createSurveyExecutor(configRef.current);

    listenerCleanupRef.current = executorRef.current.addEventListener((event) => {
      // 更新状态
      switch (event.type) {
        case "start":
          setStatus("running");
          setError(null);
          break;
        case "progress":
          setProgress(event.progress);
          setResponses(executorRef.current?.getResponses() || []);
          break;
        case "response_complete":
        case "response_error":
          setResponses(executorRef.current?.getResponses() || []);
          break;
        case "pause":
          setStatus("paused");
          break;
        case "resume":
          setStatus("running");
          break;
        case "complete":
          setStatus("completed");
          setResponses(event.results);
          break;
        case "error":
          setStatus("failed");
          setError(event.error);
          break;
        case "cancel":
          setStatus("cancelled");
          break;
      }

      // 调用外部回调
      onEventRef.current?.(event);
    });

    return () => {
      listenerCleanupRef.current?.();
      // 注意：不在清理时取消执行，让执行自然完成
    };
  }, []); // 空依赖 - 只在挂载时运行一次

  // 执行调研
  const execute = useCallback(
    async (personas: Persona[], questions: SurveyQuestion[]) => {
      if (!executorRef.current) {
        throw new Error("Executor not initialized");
      }

      // 如果执行器正在运行，先重置
      if (executorRef.current.getStatus() === "running") {
        executorRef.current.reset();
      }

      setProgress({
        total: personas.length,
        completed: 0,
        failed: 0,
        running: 0,
        pending: personas.length,
        percentage: 0,
      });

      return executorRef.current.execute(personas, questions);
    },
    []
  );

  // 暂停
  const pause = useCallback(() => {
    executorRef.current?.pause();
  }, []);

  // 恢复
  const resume = useCallback(() => {
    executorRef.current?.resume();
  }, []);

  // 取消
  const cancel = useCallback(() => {
    executorRef.current?.cancel();
  }, []);

  // 重置
  const reset = useCallback(() => {
    executorRef.current?.reset();
    setStatus("idle");
    setProgress({
      total: 0,
      completed: 0,
      failed: 0,
      running: 0,
      pending: 0,
      percentage: 0,
    });
    setResponses([]);
    setError(null);
  }, []);

  return {
    status,
    progress,
    responses,
    error,
    execute,
    pause,
    resume,
    cancel,
    reset,
  };
}
