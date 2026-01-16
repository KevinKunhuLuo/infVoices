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

  const executorRef = useRef<SurveyExecutor | null>(null);
  const onEventRef = useRef(onEvent);

  // Keep onEvent ref updated without triggering effect re-runs
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

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

  // 初始化执行器 - only recreate when config changes (using JSON comparison)
  const configRef = useRef(config);
  const configChanged = JSON.stringify(config) !== JSON.stringify(configRef.current);
  if (configChanged) {
    configRef.current = config;
  }

  useEffect(() => {
    executorRef.current = createSurveyExecutor(configRef.current);

    const removeListener = executorRef.current.addEventListener((event) => {
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

      // 调用外部回调 (使用 ref 避免依赖变化)
      onEventRef.current?.(event);
    });

    return () => {
      removeListener();
      executorRef.current?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configChanged]);

  // 执行调研
  const execute = useCallback(
    async (personas: Persona[], questions: SurveyQuestion[]) => {
      if (!executorRef.current) {
        throw new Error("Executor not initialized");
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
