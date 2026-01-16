"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Square,
  CheckSquare2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Survey, SurveyQuestion } from "@/lib/survey";

interface SurveyPreviewProps {
  survey: Survey;
}

export function SurveyPreview({ survey }: SurveyPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const currentQuestion = survey.questions[currentIndex];
  const progress = ((currentIndex + 1) / survey.questions.length) * 100;

  const goNext = () => {
    if (currentIndex < survey.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0 && survey.settings.allowBackNavigation) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const updateAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (survey.questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        问卷暂无题目
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 进度条 */}
      {survey.settings.showProgressBar && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              第 {currentIndex + 1} 题，共 {survey.questions.length} 题
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* 题目内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          <QuestionPreview
            question={currentQuestion}
            index={currentIndex}
            answer={answers[currentQuestion.id]}
            onAnswer={(value) => updateAnswer(currentQuestion.id, value)}
          />
        </motion.div>
      </AnimatePresence>

      {/* 导航按钮 */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentIndex === 0 || !survey.settings.allowBackNavigation}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          上一题
        </Button>

        {currentIndex < survey.questions.length - 1 ? (
          <Button onClick={goNext} className="gap-2">
            下一题
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Check className="h-4 w-4" />
            提交问卷
          </Button>
        )}
      </div>
    </div>
  );
}

// 单个题目预览
function QuestionPreview({
  question,
  index,
  answer,
  onAnswer,
}: {
  question: SurveyQuestion;
  index: number;
  answer: unknown;
  onAnswer: (value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      {/* 题目标题 */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-primary font-medium">Q{index + 1}.</span>
          <div>
            <h3 className="font-medium">
              {question.title || "未命名题目"}
              {question.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </h3>
            {question.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {question.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 根据题型渲染不同的答题组件 */}
      {question.type === "single_choice" && (
        <SingleChoicePreview
          question={question}
          value={answer as string}
          onChange={onAnswer}
        />
      )}

      {question.type === "multiple_choice" && (
        <MultipleChoicePreview
          question={question}
          value={answer as string[]}
          onChange={onAnswer}
        />
      )}

      {question.type === "scale" && (
        <ScalePreview
          question={question}
          value={answer as number}
          onChange={onAnswer}
        />
      )}

      {question.type === "open_text" && (
        <OpenTextPreview
          question={question}
          value={answer as string}
          onChange={onAnswer}
        />
      )}

      {question.type === "image_compare" && (
        <ImageComparePreview
          question={question}
          value={answer as string}
          onChange={onAnswer}
        />
      )}

      {question.type === "concept_test" && (
        <ConceptTestPreview
          question={question}
          value={answer as Record<string, number>}
          onChange={onAnswer}
        />
      )}
    </div>
  );
}

// 单选题预览
function SingleChoicePreview({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
      {question.options?.map((option) => (
        <div
          key={option.id}
          className={cn(
            "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
            value === option.value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30"
          )}
          onClick={() => onChange(option.value)}
        >
          <RadioGroupItem value={option.value} id={option.id} />
          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

// 多选题预览
function MultipleChoicePreview({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedValues = value || [];

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      {question.options?.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <div
            key={option.id}
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            )}
            onClick={() => toggleOption(option.value)}
          >
            <Checkbox checked={isSelected} />
            <Label className="flex-1 cursor-pointer">{option.label}</Label>
          </div>
        );
      })}
    </div>
  );
}

// 量表题预览
function ScalePreview({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: number;
  onChange: (value: number) => void;
}) {
  const config = question.scaleConfig || { min: 1, max: 5 };
  const points = Array.from(
    { length: config.max - config.min + 1 },
    (_, i) => config.min + i
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{config.minLabel || config.min}</span>
        <span>{config.maxLabel || config.max}</span>
      </div>
      <div className="flex justify-center gap-3">
        {points.map((point) => (
          <button
            key={point}
            onClick={() => onChange(point)}
            className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center font-medium transition-all",
              value === point
                ? "border-primary bg-primary text-primary-foreground scale-110"
                : "border-border hover:border-primary/50 hover:scale-105"
            )}
          >
            {point}
          </button>
        ))}
      </div>
    </div>
  );
}

// 开放文本预览
function OpenTextPreview({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Textarea
      placeholder="请输入您的回答..."
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[150px]"
    />
  );
}

// 图片对比预览
function ImageComparePreview({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  const images = question.images || [];

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          onClick={() => onChange(`image_${index}`)}
          className={cn(
            "cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
            value === `image_${index}`
              ? "border-primary ring-4 ring-primary/20"
              : "border-border hover:border-primary/30"
          )}
        >
          <div className="aspect-video bg-muted flex items-center justify-center">
            {image.url ? (
              <img
                src={image.url}
                alt={image.alt || `选项 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm">
                图片 {index + 1}
              </span>
            )}
          </div>
          {image.caption && (
            <p className="p-3 text-sm text-center">{image.caption}</p>
          )}
          {value === `image_${index}` && (
            <div className="p-2 bg-primary text-primary-foreground text-center text-sm font-medium">
              已选择
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 概念测试预览
function ConceptTestPreview({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}) {
  const config = question.conceptConfig;
  const answers = value || {};

  const updateDimensionAnswer = (dimensionId: string, rating: number) => {
    onChange({ ...answers, [dimensionId]: rating });
  };

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* 概念展示 */}
      {(config.conceptImage?.url || config.conceptDescription) && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          {config.conceptImage?.url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={config.conceptImage.url}
                alt="产品概念"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {config.conceptDescription && (
            <p className="text-sm">{config.conceptDescription}</p>
          )}
        </div>
      )}

      {/* 评估维度 */}
      <div className="space-y-6">
        {config.dimensions.map((dimension) => {
          const dimConfig = dimension.scaleConfig || { min: 1, max: 5 };
          const points = Array.from(
            { length: dimConfig.max - dimConfig.min + 1 },
            (_, i) => dimConfig.min + i
          );

          return (
            <div key={dimension.id} className="space-y-3">
              <Label className="font-medium">{dimension.name}</Label>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{dimConfig.minLabel || dimConfig.min}</span>
                <span>{dimConfig.maxLabel || dimConfig.max}</span>
              </div>
              <div className="flex justify-center gap-2">
                {points.map((point) => (
                  <button
                    key={point}
                    onClick={() => updateDimensionAnswer(dimension.id, point)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all",
                      answers[dimension.id] === point
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {point}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
