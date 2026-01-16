"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  GripVertical,
  Plus,
  Trash2,
  Upload,
  X,
  CircleDot,
  CheckSquare,
  SlidersHorizontal,
  Text,
  Images,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  SurveyQuestion,
  QuestionOption,
  ScaleConfig,
  ImageConfig,
  ConceptDimension,
} from "@/lib/survey";
import { questionTypeConfigs } from "@/lib/survey";

interface QuestionEditorProps {
  question: SurveyQuestion;
  index: number;
  onChange: (question: SurveyQuestion) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const iconMap = {
  "circle-dot": CircleDot,
  "check-square": CheckSquare,
  "sliders-horizontal": SlidersHorizontal,
  text: Text,
  images: Images,
  lightbulb: Lightbulb,
};

export function QuestionEditor({
  question,
  index,
  onChange,
  onDelete,
  onDuplicate,
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = questionTypeConfigs[question.type];
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  const updateQuestion = (updates: Partial<SurveyQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Card className="card-elevated">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                config.color
              )}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Q{index + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                  {config.name}
                </span>
              </div>
              <p className="text-sm truncate">
                {question.title || "未命名问题"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <Separator className="mb-4" />

            <div className="space-y-4">
              {/* 题目标题 */}
              <div className="space-y-2">
                <Label>题目标题</Label>
                <Textarea
                  placeholder="请输入题目标题..."
                  value={question.title}
                  onChange={(e) => updateQuestion({ title: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              {/* 题目描述（可选） */}
              <div className="space-y-2">
                <Label>
                  题目描述{" "}
                  <span className="text-muted-foreground font-normal">
                    （可选）
                  </span>
                </Label>
                <Input
                  placeholder="补充说明或提示..."
                  value={question.description || ""}
                  onChange={(e) =>
                    updateQuestion({ description: e.target.value })
                  }
                />
              </div>

              {/* 根据题型渲染不同的编辑器 */}
              {(question.type === "single_choice" ||
                question.type === "multiple_choice") && (
                <OptionsEditor
                  options={question.options || []}
                  onChange={(options) => updateQuestion({ options })}
                />
              )}

              {question.type === "scale" && (
                <ScaleEditor
                  config={question.scaleConfig}
                  onChange={(scaleConfig) => updateQuestion({ scaleConfig })}
                />
              )}

              {question.type === "image_compare" && (
                <ImageCompareEditor
                  images={question.images || []}
                  onChange={(images) => updateQuestion({ images })}
                />
              )}

              {question.type === "concept_test" && (
                <ConceptTestEditor
                  config={question.conceptConfig}
                  onChange={(conceptConfig) => updateQuestion({ conceptConfig })}
                />
              )}

              {/* 必填开关 */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>必填题目</Label>
                  <p className="text-xs text-muted-foreground">
                    启用后，受访者必须回答此题才能继续
                  </p>
                </div>
                <Switch
                  checked={question.required}
                  onCheckedChange={(required) => updateQuestion({ required })}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// 选项编辑器
function OptionsEditor({
  options,
  onChange,
}: {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
}) {
  const addOption = () => {
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      label: `选项 ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    onChange([...options, newOption]);
  };

  const updateOption = (id: string, updates: Partial<QuestionOption>) => {
    onChange(
      options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt))
    );
  };

  const deleteOption = (id: string) => {
    onChange(options.filter((opt) => opt.id !== id));
  };

  return (
    <div className="space-y-3">
      <Label>选项列表</Label>
      <Reorder.Group
        axis="y"
        values={options}
        onReorder={onChange}
        className="space-y-2"
      >
        {options.map((option) => (
          <Reorder.Item
            key={option.id}
            value={option}
            className="flex items-center gap-2"
          >
            <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              value={option.label}
              onChange={(e) =>
                updateOption(option.id, {
                  label: e.target.value,
                  value: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_\u4e00-\u9fa5]/g, ""),
                })
              }
              className="flex-1"
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
          </Reorder.Item>
        ))}
      </Reorder.Group>
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
  );
}

// 量表编辑器
function ScaleEditor({
  config,
  onChange,
}: {
  config?: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}) {
  const scaleConfig = config || {
    min: 1,
    max: 5,
    minLabel: "非常不满意",
    maxLabel: "非常满意",
    step: 1,
  };

  const updateConfig = (updates: Partial<ScaleConfig>) => {
    onChange({ ...scaleConfig, ...updates });
  };

  return (
    <div className="space-y-4">
      <Label>量表配置</Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">最小值</Label>
          <Input
            type="number"
            value={scaleConfig.min}
            onChange={(e) => updateConfig({ min: parseInt(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">最大值</Label>
          <Input
            type="number"
            value={scaleConfig.max}
            onChange={(e) => updateConfig({ max: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">最小值标签</Label>
          <Input
            placeholder="例如：非常不满意"
            value={scaleConfig.minLabel || ""}
            onChange={(e) => updateConfig({ minLabel: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">最大值标签</Label>
          <Input
            placeholder="例如：非常满意"
            value={scaleConfig.maxLabel || ""}
            onChange={(e) => updateConfig({ maxLabel: e.target.value })}
          />
        </div>
      </div>

      {/* 预览 */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-3">预览</p>
        <div className="flex items-center justify-between">
          <span className="text-xs">{scaleConfig.minLabel}</span>
          <div className="flex gap-2">
            {Array.from(
              { length: scaleConfig.max - scaleConfig.min + 1 },
              (_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center text-xs font-medium hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                >
                  {scaleConfig.min + i}
                </div>
              )
            )}
          </div>
          <span className="text-xs">{scaleConfig.maxLabel}</span>
        </div>
      </div>
    </div>
  );
}

// 图片对比编辑器
function ImageCompareEditor({
  images,
  onChange,
}: {
  images: ImageConfig[];
  onChange: (images: ImageConfig[]) => void;
}) {
  const addImage = () => {
    onChange([...images, { url: "", alt: "", caption: "" }]);
  };

  const updateImage = (index: number, updates: Partial<ImageConfig>) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], ...updates };
    onChange(newImages);
  };

  const deleteImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label>对比图片</Label>

      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 overflow-hidden">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.alt || `图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    点击上传图片
                  </span>
                </>
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
            <Input
              placeholder="图片说明..."
              value={image.caption || ""}
              onChange={(e) => updateImage(index, { caption: e.target.value })}
              className="mt-2"
            />
          </div>
        ))}

        {images.length < 4 && (
          <div
            className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={addImage}
          >
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">添加图片</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        支持上传2-4张图片进行对比，支持JPG、PNG格式
      </p>
    </div>
  );
}

// 概念测试编辑器
function ConceptTestEditor({
  config,
  onChange,
}: {
  config?: {
    conceptImage?: ImageConfig;
    conceptDescription?: string;
    dimensions: ConceptDimension[];
  };
  onChange: (config: {
    conceptImage?: ImageConfig;
    conceptDescription?: string;
    dimensions: ConceptDimension[];
  }) => void;
}) {
  const conceptConfig = config || { dimensions: [] };

  const updateConfig = (updates: Partial<typeof conceptConfig>) => {
    onChange({ ...conceptConfig, ...updates });
  };

  const addDimension = () => {
    const newDimension: ConceptDimension = {
      id: crypto.randomUUID(),
      name: `评估维度 ${conceptConfig.dimensions.length + 1}`,
      type: "scale",
      scaleConfig: { min: 1, max: 5, minLabel: "非常差", maxLabel: "非常好" },
    };
    updateConfig({ dimensions: [...conceptConfig.dimensions, newDimension] });
  };

  const updateDimension = (id: string, updates: Partial<ConceptDimension>) => {
    updateConfig({
      dimensions: conceptConfig.dimensions.map((dim) =>
        dim.id === id ? { ...dim, ...updates } : dim
      ),
    });
  };

  const deleteDimension = (id: string) => {
    updateConfig({
      dimensions: conceptConfig.dimensions.filter((dim) => dim.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* 概念图片 */}
      <div className="space-y-2">
        <Label>概念图片/产品图</Label>
        <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 overflow-hidden">
          {conceptConfig.conceptImage?.url ? (
            <img
              src={conceptConfig.conceptImage.url}
              alt="概念图"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">
                点击上传概念图
              </span>
            </>
          )}
        </div>
      </div>

      {/* 概念描述 */}
      <div className="space-y-2">
        <Label>概念描述</Label>
        <Textarea
          placeholder="请输入产品概念描述..."
          value={conceptConfig.conceptDescription || ""}
          onChange={(e) => updateConfig({ conceptDescription: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* 评估维度 */}
      <div className="space-y-3">
        <Label>评估维度</Label>
        {conceptConfig.dimensions.map((dimension) => (
          <div
            key={dimension.id}
            className="flex items-center gap-2 bg-muted/50 rounded-lg p-3"
          >
            <div className="flex-1">
              <Input
                value={dimension.name}
                onChange={(e) =>
                  updateDimension(dimension.id, { name: e.target.value })
                }
                placeholder="维度名称"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteDimension(dimension.id)}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addDimension}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          添加评估维度
        </Button>
      </div>
    </div>
  );
}
