"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Settings,
  Eye,
  Save,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { QuestionTypePicker } from "./question-type-picker";
import { QuestionEditor } from "./question-editor";
import { SurveyPreview } from "./survey-preview";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import type {
  Survey,
  SurveyQuestion,
  SurveySettings,
  QuestionType,
} from "@/lib/survey";
import {
  createQuestion,
  validateSurvey,
  defaultSurveySettings,
} from "@/lib/survey";

interface SurveyBuilderProps {
  initialSurvey?: Survey;
  projectId: string;
  onSave?: (survey: Survey) => void;
}

export function SurveyBuilder({
  initialSurvey,
  projectId,
  onSave,
}: SurveyBuilderProps) {
  const [survey, setSurvey] = useState<Survey>(() => {
    if (initialSurvey) return initialSurvey;

    return {
      id: crypto.randomUUID(),
      projectId,
      title: "",
      description: "",
      questions: [],
      settings: defaultSurveySettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 更新问卷基本信息
  const updateSurvey = useCallback((updates: Partial<Survey>) => {
    setSurvey((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 添加问题
  const addQuestion = useCallback((type: QuestionType) => {
    setSurvey((prev) => {
      const newQuestion = createQuestion(type, prev.questions.length);
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
        updatedAt: new Date().toISOString(),
      };
    });
    setIsAddingQuestion(false);
    toast.success("已添加新题目");
  }, []);

  // 更新问题
  const updateQuestion = useCallback(
    (index: number, question: SurveyQuestion) => {
      setSurvey((prev) => {
        const questions = [...prev.questions];
        questions[index] = question;
        return {
          ...prev,
          questions,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // 删除问题
  const deleteQuestion = useCallback((index: number) => {
    setSurvey((prev) => {
      const questions = prev.questions.filter((_, i) => i !== index);
      // 重新排序
      questions.forEach((q, i) => (q.order = i));
      return {
        ...prev,
        questions,
        updatedAt: new Date().toISOString(),
      };
    });
    toast.success("已删除题目");
  }, []);

  // 复制问题
  const duplicateQuestion = useCallback((index: number) => {
    setSurvey((prev) => {
      const sourceQuestion = prev.questions[index];
      const newQuestion: SurveyQuestion = {
        ...sourceQuestion,
        id: crypto.randomUUID(),
        title: sourceQuestion.title + " (副本)",
        order: prev.questions.length,
      };
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
        updatedAt: new Date().toISOString(),
      };
    });
    toast.success("已复制题目");
  }, []);

  // 重新排序问题
  const reorderQuestions = useCallback((questions: SurveyQuestion[]) => {
    questions.forEach((q, i) => (q.order = i));
    setSurvey((prev) => ({
      ...prev,
      questions,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 更新设置
  const updateSettings = useCallback((updates: Partial<SurveySettings>) => {
    setSurvey((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 保存问卷
  const handleSave = useCallback(() => {
    const errors = validateSurvey(survey);
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error("问卷存在错误，请检查");
      return;
    }

    onSave?.(survey);
    toast.success("问卷已保存");
  }, [survey, onSave]);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold">
                {survey.title || "未命名问卷"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {survey.questions.length} 道题目
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 设置按钮 */}
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  设置
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>问卷设置</SheetTitle>
                  <SheetDescription>配置问卷的行为和展示方式</SheetDescription>
                </SheetHeader>
                <div className="px-6 pb-6 mt-6 space-y-6">
                  <SettingItem
                    label="显示进度条"
                    description="在问卷顶部显示答题进度"
                    checked={survey.settings.showProgressBar}
                    onChange={(v) => updateSettings({ showProgressBar: v })}
                  />
                  <SettingItem
                    label="允许返回上一题"
                    description="受访者可以返回修改之前的答案"
                    checked={survey.settings.allowBackNavigation}
                    onChange={(v) => updateSettings({ allowBackNavigation: v })}
                  />
                  <SettingItem
                    label="随机题目顺序"
                    description="每次答题时随机打乱题目顺序"
                    checked={survey.settings.randomizeQuestions}
                    onChange={(v) => updateSettings({ randomizeQuestions: v })}
                  />
                  <SettingItem
                    label="随机选项顺序"
                    description="随机打乱选择题的选项顺序"
                    checked={survey.settings.randomizeOptions}
                    onChange={(v) => updateSettings({ randomizeOptions: v })}
                  />
                  <SettingItem
                    label="强制回答所有题目"
                    description="受访者必须回答所有题目才能提交"
                    checked={survey.settings.requireAllQuestions}
                    onChange={(v) =>
                      updateSettings({ requireAllQuestions: v })
                    }
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* 预览按钮 */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  预览
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>问卷预览</DialogTitle>
                  <DialogDescription>
                    查看受访者将看到的问卷效果
                  </DialogDescription>
                </DialogHeader>
                <SurveyPreview survey={survey} />
              </DialogContent>
            </Dialog>

            {/* 保存按钮 */}
            <Button size="sm" className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              保存
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 问卷基本信息 */}
        <motion.div
          className="mb-8 space-y-4"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="space-y-2">
            <Label className="text-base">问卷标题</Label>
            <Input
              placeholder="请输入问卷标题..."
              value={survey.title}
              onChange={(e) => updateSurvey({ title: e.target.value })}
              className="text-lg font-medium h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base">
              问卷描述{" "}
              <span className="text-muted-foreground font-normal">（可选）</span>
            </Label>
            <Textarea
              placeholder="简要描述这份问卷的目的..."
              value={survey.description || ""}
              onChange={(e) => updateSurvey({ description: e.target.value })}
            />
          </div>
        </motion.div>

        <Separator className="mb-8" />

        {/* 验证错误提示 */}
        <AnimatePresence>
          {validationErrors.length > 0 && (
            <motion.div
              className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    请修正以下问题：
                  </p>
                  <ul className="mt-2 text-sm text-destructive/90 list-disc list-inside space-y-1">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 题目列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">题目列表</h2>
            <Badge variant="secondary">{survey.questions.length} 道题目</Badge>
          </div>

          {survey.questions.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={survey.questions}
              onReorder={reorderQuestions}
              className="space-y-4"
            >
              {survey.questions.map((question, index) => (
                <Reorder.Item
                  key={question.id}
                  value={question}
                  className="list-none"
                >
                  <QuestionEditor
                    question={question}
                    index={index}
                    onChange={(q) => updateQuestion(index, q)}
                    onDelete={() => deleteQuestion(index)}
                    onDuplicate={() => duplicateQuestion(index)}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <motion.div
              className="text-center py-16 border-2 border-dashed rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">开始创建你的问卷</h3>
              <p className="text-muted-foreground mb-6">
                点击下方按钮添加第一道题目
              </p>
              <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    添加题目
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>选择题目类型</DialogTitle>
                    <DialogDescription>
                      选择一种题型来创建新的题目
                    </DialogDescription>
                  </DialogHeader>
                  <QuestionTypePicker onSelect={addQuestion} />
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {/* 添加题目按钮 */}
          {survey.questions.length > 0 && (
            <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  添加题目
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>选择题目类型</DialogTitle>
                  <DialogDescription>
                    选择一种题型来创建新的题目
                  </DialogDescription>
                </DialogHeader>
                <QuestionTypePicker onSelect={addQuestion} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

// 设置项组件
function SettingItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
