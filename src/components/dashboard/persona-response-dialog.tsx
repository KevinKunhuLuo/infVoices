"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonaChatDialog } from "./persona-chat-dialog";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { Persona } from "@/lib/supabase";
import type { SurveyAnswer } from "@/lib/llm";

interface AnswerOption {
  value: string;
  label: string;
  count: number;
}

interface PersonaResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  questionTitle: string;
  selectedAnswer?: string;
  selectedAnswerLabel?: string;
  responses: ResponseEntry[];
  /** 问题的答案选项（用于筛选） */
  answerOptions?: AnswerOption[];
}

// 人口学标签映射
const DEMOGRAPHIC_LABELS: Record<string, string> = {
  gender: "性别",
  ageRange: "年龄",
  cityTier: "城市",
  education: "学历",
  incomeLevel: "收入",
  occupation: "职业",
  familyStatus: "家庭",
  region: "地区",
};

// 单个角色卡片
function PersonaCard({
  entry,
  questionId,
  questionTitle,
  expanded,
  onToggle,
  onChat,
}: {
  entry: ResponseEntry;
  questionId: string;
  questionTitle: string;
  expanded: boolean;
  onToggle: () => void;
  onChat: (persona: Persona, answer?: SurveyAnswer) => void;
}) {
  const persona = entry.persona;
  const answer = entry.response?.answers.find((a) => a.questionId === questionId);

  // 格式化答案显示
  const formatAnswer = (answer: unknown): string => {
    if (Array.isArray(answer)) {
      return answer.join("、");
    }
    if (typeof answer === "object" && answer !== null) {
      return JSON.stringify(answer);
    }
    return String(answer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      {/* 头部 */}
      <button
        className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left"
        onClick={onToggle}
      >
        {/* 头像 */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>

        {/* 基本信息 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{persona.name}</div>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
            <span>{persona.gender}</span>
            <span>·</span>
            <span>{persona.ageRange}</span>
            <span>·</span>
            <span>{persona.cityTier}</span>
          </div>
        </div>

        {/* 人群占比 */}
        {persona.populationShare && (
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            占比 {persona.populationShare}
          </Badge>
        )}

        {/* 置信度 */}
        {answer && (
          <Badge variant="secondary" className="flex-shrink-0">
            置信度 {(answer.confidence * 100).toFixed(0)}%
          </Badge>
        )}

        {/* 展开图标 */}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* 展开详情 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              {/* 人口学详情 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <DetailItem icon={GraduationCap} label="学历" value={persona.education} />
                <DetailItem icon={DollarSign} label="收入" value={persona.incomeLevel} />
                <DetailItem icon={Briefcase} label="职业" value={persona.occupation} />
                <DetailItem icon={Users} label="家庭" value={persona.familyStatus} />
                <DetailItem icon={MapPin} label="地区" value={persona.region} />
                {persona.city && (
                  <DetailItem icon={MapPin} label="城市" value={persona.city} />
                )}
              </div>

              {/* 性格特点 */}
              {persona.traits && persona.traits.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">性格特点</p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.traits.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 回答理由 */}
              {answer?.reasoning && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">回答理由</p>
                      <p className="text-sm text-muted-foreground">{answer.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 人设描述 */}
              {persona.biography && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">人设描述</p>
                  <p>{persona.biography}</p>
                </div>
              )}

              {/* 对话按钮 */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onChat(persona, answer);
                }}
                variant="outline"
                size="sm"
                className="w-full gap-2 mt-2"
              >
                <MessageCircle className="h-4 w-4" />
                与 {persona.name} 对话
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 详情项
function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <span className="text-muted-foreground whitespace-nowrap">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function PersonaResponseDialog({
  open,
  onOpenChange,
  questionId,
  questionTitle,
  selectedAnswer: initialSelectedAnswer,
  selectedAnswerLabel: initialSelectedAnswerLabel,
  responses,
  answerOptions = [],
}: PersonaResponseDialogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDimension, setFilterDimension] = useState<string>("all");
  const [filterValue, setFilterValue] = useState<string>("all");

  // 答案筛选状态
  const [answerFilter, setAnswerFilter] = useState<string>("all");

  // 聊天状态
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPersona, setChatPersona] = useState<Persona | null>(null);
  const [chatAnswer, setChatAnswer] = useState<SurveyAnswer | undefined>();

  // 当对话框打开时，同步初始选中的答案
  useMemo(() => {
    if (open && initialSelectedAnswer !== undefined) {
      setAnswerFilter(initialSelectedAnswer);
    } else if (!open) {
      setAnswerFilter("all");
    }
  }, [open, initialSelectedAnswer]);

  // 打开聊天对话框
  const handleOpenChat = (persona: Persona, answer?: SurveyAnswer) => {
    setChatPersona(persona);
    setChatAnswer(answer);
    setChatOpen(true);
  };

  // 从响应中自动提取答案选项（如果没有传入）
  const computedAnswerOptions = useMemo(() => {
    if (answerOptions.length > 0) return answerOptions;

    const answerCounts = new Map<string, { label: string; count: number }>();

    responses.forEach((entry) => {
      if (entry.status !== "completed" || !entry.response) return;
      const answer = entry.response.answers.find((a) => a.questionId === questionId);
      if (!answer) return;

      const answerValue = answer.answer;
      if (Array.isArray(answerValue)) {
        answerValue.forEach((v) => {
          const key = String(v);
          const existing = answerCounts.get(key);
          answerCounts.set(key, {
            label: key,
            count: (existing?.count || 0) + 1,
          });
        });
      } else {
        const key = String(answerValue);
        const existing = answerCounts.get(key);
        answerCounts.set(key, {
          label: key,
          count: (existing?.count || 0) + 1,
        });
      }
    });

    return Array.from(answerCounts.entries())
      .map(([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => b.count - a.count);
  }, [responses, questionId, answerOptions]);

  // 当前选中的答案
  const currentAnswerFilter = answerFilter;
  const currentAnswerLabel = useMemo(() => {
    if (currentAnswerFilter === "all") return null;
    const option = computedAnswerOptions.find((o) => o.value === currentAnswerFilter);
    return option?.label || currentAnswerFilter;
  }, [currentAnswerFilter, computedAnswerOptions]);

  // 筛选出选择了指定答案的响应
  const filteredResponses = useMemo(() => {
    let filtered = responses.filter((entry) => {
      if (entry.status !== "completed" || !entry.response) return false;

      const answer = entry.response.answers.find((a) => a.questionId === questionId);
      if (!answer) return false;

      // 按答案筛选
      if (currentAnswerFilter !== "all") {
        const answerValue = answer.answer;
        if (Array.isArray(answerValue)) {
          if (!answerValue.includes(currentAnswerFilter)) return false;
        } else {
          if (String(answerValue) !== currentAnswerFilter) return false;
        }
      }

      return true;
    });

    // 应用人口学筛选
    if (filterDimension !== "all" && filterValue !== "all") {
      filtered = filtered.filter((entry) => {
        const persona = entry.persona as unknown as Record<string, string>;
        return persona[filterDimension] === filterValue;
      });
    }

    return filtered;
  }, [responses, questionId, currentAnswerFilter, filterDimension, filterValue]);

  // 获取可用的人口学筛选值
  const filterOptions = useMemo(() => {
    if (filterDimension === "all") return [];

    const values = new Set<string>();
    // 基于答案筛选后的响应计算可用的人口学值
    const baseResponses = responses.filter((entry) => {
      if (entry.status !== "completed" || !entry.response) return false;
      const answer = entry.response.answers.find((a) => a.questionId === questionId);
      if (!answer) return false;
      if (currentAnswerFilter !== "all") {
        const answerValue = answer.answer;
        if (Array.isArray(answerValue)) {
          if (!answerValue.includes(currentAnswerFilter)) return false;
        } else {
          if (String(answerValue) !== currentAnswerFilter) return false;
        }
      }
      return true;
    });

    baseResponses.forEach((entry) => {
      const persona = entry.persona as unknown as Record<string, string>;
      const value = persona[filterDimension];
      if (value) values.add(value);
    });

    return Array.from(values).sort();
  }, [filterDimension, responses, questionId, currentAnswerFilter]);

  // 重置人口学筛选
  const handleDimensionChange = (dim: string) => {
    setFilterDimension(dim);
    setFilterValue("all");
  };

  // 重置所有筛选
  const handleClearAll = () => {
    setAnswerFilter("all");
    setFilterDimension("all");
    setFilterValue("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="pr-8">
            <span className="text-muted-foreground text-sm font-normal block mb-1">
              查看个体回答
            </span>
            {questionTitle}
          </DialogTitle>
          <div className="mt-2 flex items-center flex-wrap gap-2">
            {currentAnswerLabel && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                答案: {currentAnswerLabel}
              </Badge>
            )}
            {filterDimension !== "all" && filterValue !== "all" && (
              <Badge variant="secondary">
                {DEMOGRAPHIC_LABELS[filterDimension]}: {filterValue}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              共 {filteredResponses.length} 人
            </span>
          </div>
        </DialogHeader>

        {/* 筛选器 */}
        <div className="flex flex-wrap items-center gap-3 py-3 border-b">
          {/* 答案筛选 */}
          {computedAnswerOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">答案:</span>
              <Select value={answerFilter} onValueChange={setAnswerFilter}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue placeholder="选择答案" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">全部答案</SelectItem>
                  {computedAnswerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="truncate max-w-[120px] inline-block align-bottom">
                        {option.label}
                      </span>
                      <span className="text-muted-foreground ml-1">({option.count})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 分隔符 */}
          {computedAnswerOptions.length > 0 && (
            <div className="h-4 w-px bg-border" />
          )}

          {/* 人口学筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">画像:</span>
            <Select value={filterDimension} onValueChange={handleDimensionChange}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue placeholder="选择维度" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(DEMOGRAPHIC_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterDimension !== "all" && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue placeholder="选择值" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">全部</SelectItem>
                  {filterOptions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 清除按钮 */}
          {(answerFilter !== "all" || filterDimension !== "all" || filterValue !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              清除筛选
            </Button>
          )}
        </div>

        {/* 响应列表 */}
        <div className="flex-1 -mx-6 px-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          <div className="space-y-3 py-4">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>没有找到匹配的回答</p>
              </div>
            ) : (
              filteredResponses.map((entry) => (
                <PersonaCard
                  key={entry.id}
                  entry={entry}
                  questionId={questionId}
                  questionTitle={questionTitle}
                  expanded={expandedId === entry.id}
                  onToggle={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                  onChat={handleOpenChat}
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>

      {/* 聊天对话框 */}
      {chatPersona && (
        <PersonaChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          persona={chatPersona}
          questionContext={
            chatAnswer
              ? { questionTitle, answer: chatAnswer }
              : undefined
          }
        />
      )}
    </Dialog>
  );
}
