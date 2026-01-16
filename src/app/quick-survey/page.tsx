"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  CircleDot,
  CheckSquare,
  SlidersHorizontal,
  Text,
  ArrowRight,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { QuestionType, Survey, QuestionOption } from "@/lib/survey";
import { createQuestion, defaultSurveySettings } from "@/lib/survey";

// 快速调研支持的题型（简化版，不包含图片和概念测试）
const quickQuestionTypes = [
  {
    type: "single_choice" as QuestionType,
    name: "单选题",
    description: "从多个选项中选择一个",
    icon: CircleDot,
    color: "bg-blue-500",
  },
  {
    type: "multiple_choice" as QuestionType,
    name: "多选题",
    description: "可选择多个答案",
    icon: CheckSquare,
    color: "bg-purple-500",
  },
  {
    type: "scale" as QuestionType,
    name: "量表题",
    description: "1-5分评分",
    icon: SlidersHorizontal,
    color: "bg-amber-500",
  },
  {
    type: "open_text" as QuestionType,
    name: "开放题",
    description: "自由文字回答",
    icon: Text,
    color: "bg-emerald-500",
  },
];

export default function QuickSurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "content">("type");
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: crypto.randomUUID(), label: "选项 1", value: "option_1" },
    { id: crypto.randomUUID(), label: "选项 2", value: "option_2" },
  ]);

  // 选择题型
  const handleSelectType = (type: QuestionType) => {
    setSelectedType(type);
    setStep("content");
  };

  // 添加选项
  const addOption = () => {
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      label: `选项 ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    setOptions([...options, newOption]);
  };

  // 更新选项
  const updateOption = (id: string, label: string) => {
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? {
              ...opt,
              label,
              value: label
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_\u4e00-\u9fa5]/g, ""),
            }
          : opt
      )
    );
  };

  // 删除选项
  const deleteOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((opt) => opt.id !== id));
  };

  // 创建快速问卷并跳转
  const handleCreate = () => {
    if (!questionTitle.trim()) {
      toast.error("请输入问题内容");
      return;
    }

    if (!selectedType) {
      toast.error("请选择题型");
      return;
    }

    // 验证选项题
    if (
      (selectedType === "single_choice" || selectedType === "multiple_choice") &&
      options.some((opt) => !opt.label.trim())
    ) {
      toast.error("请填写所有选项内容");
      return;
    }

    // 创建问题
    const question = createQuestion(selectedType, 0);
    question.title = questionTitle;
    question.required = true;

    // 如果是选项题，更新选项
    if (selectedType === "single_choice" || selectedType === "multiple_choice") {
      question.options = options;
    }

    // 创建快速问卷
    const survey: Survey = {
      id: crypto.randomUUID(),
      projectId: "quick-survey",
      title: "快速问题",
      description: "快速调研问卷",
      questions: [question],
      settings: defaultSurveySettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 保存到 localStorage
    const surveys = JSON.parse(localStorage.getItem("surveys") || "[]");
    surveys.push(survey);
    localStorage.setItem("surveys", JSON.stringify(surveys));

    // 跳转到问卷详情页
    toast.success("快速问卷已创建");
    router.push(`/survey/${survey.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部 */}
      <div className="bg-gradient-brand text-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            className="flex items-center gap-3 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-2 rounded-lg bg-white/20">
              <Zap className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">快速调研</h1>
          </motion.div>
          <motion.p
            className="text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            一道题，快速获得虚拟人口反馈
          </motion.p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤 1: 选择题型 */}
        {step === "type" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <h2 className="text-lg font-semibold mb-1">选择题型</h2>
              <p className="text-sm text-muted-foreground">
                选择最适合你调研需求的题型
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {quickQuestionTypes.map((qType) => {
                const Icon = qType.icon;
                return (
                  <motion.div key={qType.type} variants={staggerItem}>
                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                        "border-2 border-transparent hover:border-primary/30"
                      )}
                      onClick={() => handleSelectType(qType.type)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              qType.color
                            )}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{qType.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {qType.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div variants={fadeInUp} className="mt-8 text-center">
              <Button variant="outline" onClick={() => router.push("/")}>
                返回首页
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* 步骤 2: 编辑问题内容 */}
        {step === "content" && selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 返回按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("type")}
              className="mb-4"
            >
              ← 返回选择题型
            </Button>

            {/* 题型标识 */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {(() => {
                const typeConfig = quickQuestionTypes.find(
                  (t) => t.type === selectedType
                );
                if (!typeConfig) return null;
                const Icon = typeConfig.icon;
                return (
                  <>
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        typeConfig.color
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{typeConfig.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeConfig.description}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 问题内容 */}
            <div className="space-y-2">
              <Label className="text-base">问题内容</Label>
              <Textarea
                placeholder="例如：你更喜欢哪种口味的冰淇淋？"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                className="min-h-[100px] text-base"
                autoFocus
              />
            </div>

            {/* 选项编辑器（单选/多选题） */}
            {(selectedType === "single_choice" ||
              selectedType === "multiple_choice") && (
              <div className="space-y-3">
                <Label>选项列表</Label>
                <div className="space-y-2">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div className="p-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1"
                        placeholder="请输入选项内容"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteOption(option.id)}
                        className="h-8 w-8 shrink-0"
                        disabled={options.length <= 2}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  添加选项
                </Button>
              </div>
            )}

            {/* 量表题提示 */}
            {selectedType === "scale" && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  将使用默认 1-5 分量表
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">非常不满意</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center text-xs font-medium"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">非常满意</span>
                </div>
              </div>
            )}

            {/* 开放题提示 */}
            {selectedType === "open_text" && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  虚拟受访者将自由输入文字回答，结果将以词云形式展示。
                </p>
              </div>
            )}

            {/* 创建按钮 */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                取消
              </Button>
              <Button className="flex-1 gap-2" onClick={handleCreate}>
                创建并开始调研
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
