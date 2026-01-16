"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSurveyExecutor } from "@/hooks/use-survey-executor";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { Persona } from "@/lib/supabase";
import type { SurveyQuestion } from "@/lib/survey";
import type { ExecutionConfig, ResponseEntry, ResponseStatus } from "@/lib/survey/executor";

interface SurveyRunnerProps {
  personas: Persona[];
  questions: SurveyQuestion[];
  config?: Partial<ExecutionConfig>;
  onComplete?: (responses: ResponseEntry[]) => void;
}

export function SurveyRunner({
  personas,
  questions,
  config,
  onComplete,
}: SurveyRunnerProps) {
  const [isResponseListOpen, setIsResponseListOpen] = useState(true);

  const {
    status,
    progress,
    responses,
    error,
    execute,
    pause,
    resume,
    cancel,
    reset,
  } = useSurveyExecutor({
    config,
    onEvent: (event) => {
      if (event.type === "complete") {
        onComplete?.(event.results);
      }
    },
  });

  const handleStart = async () => {
    try {
      await execute(personas, questions);
    } catch (err) {
      console.error("Survey execution error:", err);
    }
  };

  // 格式化时间
  const formatTime = (ms?: number): string => {
    if (!ms) return "--";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  // 统计数据
  const stats = useMemo(() => {
    const successRate =
      progress.total > 0
        ? Math.round(
            (progress.completed / (progress.completed + progress.failed || 1)) * 100
          )
        : 0;

    return {
      successRate,
      avgTime: formatTime(progress.averageResponseTime),
      estimatedRemaining: formatTime(progress.estimatedTimeRemaining),
    };
  }, [progress]);

  const isIdle = status === "idle";
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isCancelled = status === "cancelled";
  const isFinished = isCompleted || isFailed || isCancelled;

  return (
    <div className="space-y-6">
      {/* 主控制面板 */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              调研执行
            </CardTitle>
            <StatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.completed} / {progress.total} 完成
              </span>
              <span className="font-medium">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
          </div>

          {/* 统计卡片 */}
          <motion.div
            className="grid grid-cols-4 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <StatCard
                icon={Users}
                label="总样本"
                value={progress.total.toString()}
                color="text-blue-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={CheckCircle}
                label="已完成"
                value={progress.completed.toString()}
                color="text-emerald-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={XCircle}
                label="失败"
                value={progress.failed.toString()}
                color="text-red-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={Clock}
                label="预计剩余"
                value={stats.estimatedRemaining}
                color="text-amber-500"
              />
            </motion.div>
          </motion.div>

          {/* 控制按钮 */}
          <div className="flex gap-2">
            {isIdle && (
              <Button onClick={handleStart} className="flex-1 gap-2">
                <Play className="h-4 w-4" />
                开始执行
              </Button>
            )}

            {isRunning && (
              <>
                <Button
                  variant="outline"
                  onClick={pause}
                  className="flex-1 gap-2"
                >
                  <Pause className="h-4 w-4" />
                  暂停
                </Button>
                <Button
                  variant="destructive"
                  onClick={cancel}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  取消
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button onClick={resume} className="flex-1 gap-2">
                  <Play className="h-4 w-4" />
                  继续
                </Button>
                <Button
                  variant="destructive"
                  onClick={cancel}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  取消
                </Button>
              </>
            )}

            {isFinished && (
              <Button
                variant="outline"
                onClick={reset}
                className="flex-1 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                重新开始
              </Button>
            )}
          </div>

          {/* 错误提示 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 响应列表 */}
      {responses.length > 0 && (
        <Collapsible open={isResponseListOpen} onOpenChange={setIsResponseListOpen}>
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <CardTitle className="text-lg">响应详情</CardTitle>
                  {isResponseListOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {responses.map((entry) => (
                      <ResponseItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}

// 状态徽章
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon?: React.ReactNode }> = {
    idle: { label: "就绪", variant: "secondary" },
    preparing: { label: "准备中", variant: "secondary", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    running: { label: "执行中", variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    paused: { label: "已暂停", variant: "outline" },
    completed: { label: "已完成", variant: "default" },
    failed: { label: "失败", variant: "destructive" },
    cancelled: { label: "已取消", variant: "secondary" },
  };

  const { label, variant, icon } = config[status] || { label: status, variant: "secondary" as const };

  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  );
}

// 统计卡片
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <Icon className={cn("h-5 w-5 mx-auto mb-1", color)} />
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// 响应条目
function ResponseItem({ entry }: { entry: ResponseEntry }) {
  const statusConfig: Record<ResponseStatus, { color: string; icon: React.ReactNode }> = {
    pending: {
      color: "text-muted-foreground",
      icon: <Clock className="h-4 w-4" />,
    },
    running: {
      color: "text-blue-500",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    completed: {
      color: "text-emerald-500",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    failed: {
      color: "text-red-500",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const { color, icon } = statusConfig[entry.status];
  const duration =
    entry.startTime && entry.endTime
      ? `${((entry.endTime - entry.startTime) / 1000).toFixed(1)}s`
      : null;

  // 获取头像颜色
  const avatarColor =
    entry.persona.gender === "女"
      ? "bg-pink-500"
      : "bg-blue-500";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Avatar className={cn("h-10 w-10", avatarColor)}>
        <AvatarFallback className="text-white font-medium">
          {entry.persona.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{entry.persona.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {entry.persona.ageRange} · {entry.persona.city} · {entry.persona.occupation}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {duration && (
          <span className="text-xs text-muted-foreground">{duration}</span>
        )}
        <span className={color}>{icon}</span>
      </div>
    </div>
  );
}
