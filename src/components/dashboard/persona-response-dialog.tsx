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

interface PersonaResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  questionTitle: string;
  selectedAnswer?: string;
  selectedAnswerLabel?: string;
  responses: ResponseEntry[];
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
  selectedAnswer,
  selectedAnswerLabel,
  responses,
}: PersonaResponseDialogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDimension, setFilterDimension] = useState<string>("all");
  const [filterValue, setFilterValue] = useState<string>("all");

  // 聊天状态
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPersona, setChatPersona] = useState<Persona | null>(null);
  const [chatAnswer, setChatAnswer] = useState<SurveyAnswer | undefined>();

  // 打开聊天对话框
  const handleOpenChat = (persona: Persona, answer?: SurveyAnswer) => {
    setChatPersona(persona);
    setChatAnswer(answer);
    setChatOpen(true);
  };

  // 筛选出选择了指定答案的响应
  const filteredResponses = useMemo(() => {
    let filtered = responses.filter((entry) => {
      if (entry.status !== "completed" || !entry.response) return false;

      const answer = entry.response.answers.find((a) => a.questionId === questionId);
      if (!answer) return false;

      // 如果指定了答案，筛选匹配的
      if (selectedAnswer !== undefined) {
        const answerValue = answer.answer;
        if (Array.isArray(answerValue)) {
          return answerValue.includes(selectedAnswer);
        }
        return String(answerValue) === selectedAnswer;
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
  }, [responses, questionId, selectedAnswer, filterDimension, filterValue]);

  // 获取可用的筛选值
  const filterOptions = useMemo(() => {
    if (filterDimension === "all") return [];

    const values = new Set<string>();
    filteredResponses.forEach((entry) => {
      const persona = entry.persona as unknown as Record<string, string>;
      const value = persona[filterDimension];
      if (value) values.add(value);
    });

    return Array.from(values).sort();
  }, [filterDimension, responses, questionId, selectedAnswer]);

  // 重置筛选
  const handleDimensionChange = (dim: string) => {
    setFilterDimension(dim);
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
          {selectedAnswerLabel && (
            <div className="mt-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                选择: {selectedAnswerLabel}
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">
                共 {filteredResponses.length} 人
              </span>
            </div>
          )}
        </DialogHeader>

        {/* 筛选器 */}
        <div className="flex items-center gap-3 py-3 border-b">
          <span className="text-sm text-muted-foreground">筛选:</span>
          <Select value={filterDimension} onValueChange={handleDimensionChange}>
            <SelectTrigger className="w-32 h-8">
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
              <SelectTrigger className="w-32 h-8">
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

          {(filterDimension !== "all" || filterValue !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterDimension("all");
                setFilterValue("all");
              }}
            >
              清除
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
