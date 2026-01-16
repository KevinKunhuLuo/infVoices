"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  staggerContainer,
  staggerItem,
  cardHover,
  fadeInUp,
} from "@/lib/motion";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "completed";
  responseCount: number;
  questionCount: number;
  createdAt: string;
}

const statusConfig = {
  draft: {
    label: "草稿",
    color: "bg-muted text-muted-foreground",
    icon: FileText,
  },
  running: {
    label: "进行中",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: PlayCircle,
  },
  completed: {
    label: "已完成",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);

  // 从 localStorage 加载保存的问卷
  useEffect(() => {
    const savedSurveys = localStorage.getItem("surveys");
    if (savedSurveys) {
      try {
        const surveys = JSON.parse(savedSurveys);
        const projectList: Project[] = surveys.map((survey: { id: string; title: string; description?: string; questions?: unknown[]; createdAt?: string }) => ({
          id: survey.id,
          name: survey.title || "未命名调研",
          description: survey.description || "",
          status: "draft" as const,
          responseCount: 0,
          questionCount: survey.questions?.length || 0,
          createdAt: survey.createdAt || new Date().toISOString().split("T")[0],
        }));
        setProjects(projectList);
      } catch (e) {
        console.error("Failed to load surveys:", e);
      }
    }
  }, []);

  // 删除项目
  const handleDelete = (projectId: string) => {
    const savedSurveys = localStorage.getItem("surveys");
    if (savedSurveys) {
      const surveys = JSON.parse(savedSurveys);
      const filtered = surveys.filter((s: { id: string }) => s.id !== projectId);
      localStorage.setItem("surveys", JSON.stringify(filtered));
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题区域 */}
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">调研项目</h1>
            <p className="mt-2 text-muted-foreground">
              管理你的虚拟人口调研，快速获得市场洞察
            </p>
          </div>
        </div>
      </motion.div>

      {/* 快速统计卡片 */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={staggerItem}>
          <Card className="card-elevated hover:card-elevated-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">总项目数</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="card-elevated hover:card-elevated-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">总回答数</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.responseCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="card-elevated hover:card-elevated-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">进行中</p>
                  <p className="text-2xl font-bold">
                    {projects.filter((p) => p.status === "running").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* 项目列表 */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* 快速调研卡片 */}
        <motion.div variants={staggerItem}>
          <Link href="/quick-survey">
            <motion.div
              className={cn(
                "group relative h-full min-h-[200px]",
                "rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/50",
                "hover:border-amber-500 transition-colors",
                "flex flex-col items-center justify-center gap-4",
                "cursor-pointer bg-amber-50/50 dark:bg-amber-500/5"
              )}
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <div
                className={cn(
                  "p-4 rounded-2xl",
                  "bg-amber-100 group-hover:bg-amber-500 dark:bg-amber-500/20 dark:group-hover:bg-amber-500",
                  "transition-all duration-300"
                )}
              >
                <Zap
                  className={cn(
                    "h-8 w-8",
                    "text-amber-600 group-hover:text-white dark:text-amber-400 dark:group-hover:text-white",
                    "transition-colors duration-300"
                  )}
                />
              </div>
              <div className="text-center">
                <p className="font-medium">快速调研</p>
                <p className="text-sm text-muted-foreground">
                  一道题，快速获得反馈
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 新建项目卡片 */}
        <motion.div variants={staggerItem}>
          <Link href="/survey/new">
            <motion.div
              className={cn(
                "group relative h-full min-h-[200px]",
                "rounded-2xl border-2 border-dashed border-border",
                "hover:border-primary/50 transition-colors",
                "flex flex-col items-center justify-center gap-4",
                "cursor-pointer"
              )}
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <div
                className={cn(
                  "p-4 rounded-2xl",
                  "bg-gradient-brand-subtle group-hover:bg-gradient-brand",
                  "transition-all duration-300"
                )}
              >
                <Plus
                  className={cn(
                    "h-8 w-8",
                    "text-primary group-hover:text-white",
                    "transition-colors duration-300"
                  )}
                />
              </div>
              <div className="text-center">
                <p className="font-medium">新建调研项目</p>
                <p className="text-sm text-muted-foreground">
                  创建虚拟人口调研
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 项目卡片列表 */}
        {projects.map((project) => {
          const status = statusConfig[project.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <motion.div key={project.id} variants={staggerItem}>
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Card className="card-elevated hover:card-elevated-hover transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant="secondary"
                        className={cn("gap-1.5", status.color)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 -mt-2"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>编辑</DropdownMenuItem>
                          <DropdownMenuItem>复制</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Link href={`/survey/${project.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{project.responseCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>{project.questionCount} 题</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Clock className="h-4 w-4" />
                        <span>{project.createdAt}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 空状态提示 - 当没有项目时显示 */}
      {projects.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex p-4 rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">还没有调研项目</h3>
          <p className="text-muted-foreground mb-6">
            创建你的第一个虚拟人口调研，快速获得市场洞察
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/quick-survey">
                <Zap className="h-4 w-4 mr-2" />
                快速调研
              </Link>
            </Button>
            <Button asChild className="btn-gradient text-white">
              <Link href="/survey/new">
                <Plus className="h-4 w-4 mr-2" />
                新建调研项目
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
