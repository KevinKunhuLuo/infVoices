"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  FileBarChart,
  RefreshCw,
  AlertCircle,
  Users,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SurveyRunner } from "@/components/survey";
import { AnalysisDashboard } from "@/components/dashboard";
import { ExportDialog } from "@/components/export";
import { generateAnalysisReport } from "@/lib/analysis";
import { generatePersonas, allDimensions, audiencePresets, calculateSampleSize } from "@/lib/personas";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { Survey } from "@/lib/survey";
import type { Persona, DimensionConfig } from "@/lib/supabase";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { AnalysisReport } from "@/lib/analysis";

// 预设样本量选项
const SAMPLE_SIZE_PRESETS = [
  { value: 50, label: "50", description: "快速测试" },
  { value: 100, label: "100", description: "小规模调研" },
  { value: 300, label: "300", description: "标准样本" },
  { value: 500, label: "500", description: "较大样本" },
  { value: 1000, label: "1000", description: "大规模调研" },
];

export default function SurveyDetailPage() {
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"config" | "run" | "results">("config");
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // 样本配置状态
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [customSize, setCustomSize] = useState<string>("");
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [audienceFilters, setAudienceFilters] = useState<DimensionConfig>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // LLM 配置状态
  const [llmModel, setLlmModel] = useState<string>("");

  // 计算当前活跃的筛选数量
  const activeFilterCount = useMemo(() => {
    return Object.values(audienceFilters).filter((v) => v && v.length > 0).length;
  }, [audienceFilters]);

  // 加载问卷数据和 LLM 设置
  useEffect(() => {
    const savedSurveys = localStorage.getItem("surveys");
    if (savedSurveys) {
      try {
        const surveys = JSON.parse(savedSurveys);
        const found = surveys.find((s: Survey) => s.id === surveyId);
        if (found) {
          setSurvey(found);
        }
      } catch (e) {
        console.error("Failed to load survey:", e);
      }
    }

    // 加载 LLM 设置
    const llmSettings = localStorage.getItem("llm_settings");
    if (llmSettings) {
      try {
        const settings = JSON.parse(llmSettings);
        if (settings.openrouterModel) {
          setLlmModel(settings.openrouterModel);
        }
      } catch (e) {
        console.error("Failed to load LLM settings:", e);
      }
    }

    setLoading(false);
  }, [surveyId]);

  // 处理样本量选择
  const handleSampleSizeSelect = (size: number) => {
    setSampleSize(size);
    setIsCustomSize(false);
    setCustomSize("");
  };

  // 处理自定义样本量
  const handleCustomSizeChange = (value: string) => {
    setCustomSize(value);
    const num = parseInt(value, 10);
    if (num > 0 && num <= 2000) {
      setSampleSize(num);
      setIsCustomSize(true);
    }
  };

  // 更新筛选条件
  const handleFilterChange = (dimensionId: string, values: string[]) => {
    setAudienceFilters((prev) => ({
      ...prev,
      [dimensionId]: values.length > 0 ? values : undefined,
    }));
    setSelectedPreset(""); // 清除预设选择
  };

  // 应用预设
  const applyPreset = (presetId: string) => {
    const preset = audiencePresets.find((p) => p.id === presetId);
    if (preset) {
      setAudienceFilters(preset.dimensions);
      setSelectedPreset(presetId);
    }
  };

  // 清除筛选
  const clearFilters = () => {
    setAudienceFilters({});
    setSelectedPreset("");
  };

  // 开始调研（生成角色并切换到执行页面）
  const handleStartSurvey = () => {
    const generatedPersonas = generatePersonas(sampleSize, audienceFilters);
    setPersonas(generatedPersonas);
    setActiveTab("run");
  };

  // 处理执行完成
  const handleComplete = (completedResponses: ResponseEntry[]) => {
    if (!survey) return;

    setResponses(completedResponses);

    // 生成分析报告
    const analysisReport = generateAnalysisReport(
      survey.id,
      survey.title,
      survey.questions,
      completedResponses
    );

    setReport(analysisReport);
    setActiveTab("results");
  };

  // 重置
  const handleReset = () => {
    setResponses([]);
    setReport(null);
    setActiveTab("run");
  };

  if (loading) {
    return (
      <>
        <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-8 mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  if (!survey) {
    return (
      <>
        <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-8 mx-auto">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">问卷不存在</h2>
              <p className="text-muted-foreground mb-6">
                未找到ID为 {surveyId} 的问卷
              </p>
              <Button asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-8 mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* 页面头部 */}
        <motion.div
          variants={staggerItem}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{survey.title}</h1>
              <p className="text-muted-foreground text-sm">
                {survey.description || "执行调研并查看可视化分析结果"}
              </p>
            </div>
          </div>
          {report && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              重新开始
            </Button>
          )}
        </motion.div>

        {/* 主要内容 */}
        <motion.div variants={staggerItem}>
          <TooltipProvider>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "config" | "run" | "results")}
            >
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid mb-6">
                <TabsTrigger value="config" className="gap-2">
                  <Users className="h-4 w-4" />
                  样本配置
                </TabsTrigger>
                <TabsTrigger value="run" className="gap-2" disabled={personas.length === 0}>
                  <Play className="h-4 w-4" />
                  执行调研
                </TabsTrigger>
                <TabsTrigger value="results" className="gap-2" disabled={!report}>
                  <FileBarChart className="h-4 w-4" />
                  分析结果
                </TabsTrigger>
              </TabsList>

              {/* 样本配置 Tab */}
              <TabsContent value="config">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* 左侧：样本量选择 */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          样本量设置
                        </CardTitle>
                        <CardDescription>
                          选择调研的虚拟角色数量，样本量越大结果越可靠
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* 预设选项 */}
                        <div className="grid grid-cols-5 gap-3">
                          {SAMPLE_SIZE_PRESETS.map((preset) => (
                            <Tooltip key={preset.value}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleSampleSizeSelect(preset.value)}
                                  className={cn(
                                    "p-4 rounded-xl border-2 transition-all text-center",
                                    sampleSize === preset.value && !isCustomSize
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <div className="text-2xl font-bold">{preset.label}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {preset.description}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{preset.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>

                        {/* 自定义输入 */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label htmlFor="custom-size" className="text-sm text-muted-foreground">
                              自定义样本量（10-2000）
                            </Label>
                            <Input
                              id="custom-size"
                              type="number"
                              min={10}
                              max={2000}
                              placeholder="输入自定义数量..."
                              value={customSize}
                              onChange={(e) => handleCustomSizeChange(e.target.value)}
                              className={cn(
                                "mt-1.5",
                                isCustomSize && "border-primary"
                              )}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-6">
                            <Info className="h-4 w-4" />
                            <span>当前选择: <strong className="text-foreground">{sampleSize}</strong> 个角色</span>
                          </div>
                        </div>

                        {/* 置信度参考 */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>参考：</strong>样本量与置信度关系
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-medium">100 样本</p>
                              <p className="text-muted-foreground">95% 置信度 ±10%</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">400 样本</p>
                              <p className="text-muted-foreground">95% 置信度 ±5%</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">1000 样本</p>
                              <p className="text-muted-foreground">95% 置信度 ±3%</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 人群筛选 */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <SlidersHorizontal className="h-5 w-5 text-primary" />
                              目标人群筛选
                            </CardTitle>
                            <CardDescription>
                              筛选特定人群，或使用预设场景
                            </CardDescription>
                          </div>
                          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                              <Button variant="outline" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                高级筛选
                                {activeFilterCount > 0 && (
                                  <Badge variant="secondary" className="ml-1">
                                    {activeFilterCount}
                                  </Badge>
                                )}
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
                              <SheetHeader className="px-6 pt-6">
                                <SheetTitle>筛选条件</SheetTitle>
                                <SheetDescription>
                                  选择维度条件来筛选特定人群
                                </SheetDescription>
                              </SheetHeader>
                              <div className="px-6 pb-6 mt-6 space-y-6">
                                {allDimensions.map((dimension) => (
                                  <div key={dimension.id}>
                                    <label className="text-sm font-medium mb-2 block">
                                      {dimension.name}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {dimension.options.map((option) => {
                                        const currentValues =
                                          (audienceFilters as Record<string, string[]>)[dimension.id] || [];
                                        const isSelected = currentValues.includes(option.value);

                                        return (
                                          <Badge
                                            key={option.value}
                                            variant={isSelected ? "default" : "outline"}
                                            className={cn(
                                              "cursor-pointer transition-colors",
                                              isSelected && "bg-primary"
                                            )}
                                            onClick={() => {
                                              const newValues = isSelected
                                                ? currentValues.filter((v) => v !== option.value)
                                                : [...currentValues, option.value];
                                              handleFilterChange(dimension.id, newValues);
                                            }}
                                          >
                                            {option.label}
                                            <span className="ml-1 text-xs opacity-60">
                                              {Math.round(option.weight * 100)}%
                                            </span>
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={clearFilters}
                                  >
                                    清除
                                  </Button>
                                  <Button
                                    className="flex-1"
                                    onClick={() => setIsFilterOpen(false)}
                                  >
                                    应用
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 快速预设 */}
                        <div>
                          <Label className="text-sm text-muted-foreground">快速预设</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant={selectedPreset === "" && activeFilterCount === 0 ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={clearFilters}
                            >
                              全国代表性样本
                            </Badge>
                            {audiencePresets.slice(1).map((preset) => (
                              <Badge
                                key={preset.id}
                                variant={selectedPreset === preset.id ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => applyPreset(preset.id)}
                              >
                                {preset.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* 当前筛选条件展示 */}
                        {(selectedPreset || activeFilterCount > 0) && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">当前筛选条件：</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedPreset && (
                                <Badge variant="secondary">
                                  {audiencePresets.find((p) => p.id === selectedPreset)?.name}
                                </Badge>
                              )}
                              {!selectedPreset &&
                                Object.entries(audienceFilters).map(([dimId, values]) => {
                                  if (!values || values.length === 0) return null;
                                  const dimension = allDimensions.find((d) => d.id === dimId);
                                  return (values as string[]).map((value) => {
                                    const option = dimension?.options.find((o) => o.value === value);
                                    return (
                                      <Badge key={`${dimId}-${value}`} variant="secondary">
                                        {option?.label || value}
                                      </Badge>
                                    );
                                  });
                                })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 开始按钮 */}
                    <Button
                      size="lg"
                      className="w-full gap-2 btn-gradient text-white h-14 text-lg"
                      onClick={handleStartSurvey}
                    >
                      <Play className="h-5 w-5" />
                      生成 {sampleSize} 个角色并开始调研
                    </Button>
                  </div>

                  {/* 右侧：调研概览 */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">调研概览</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">问卷标题</p>
                          <p className="font-medium">{survey.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">问题数量</p>
                          <p className="font-medium">{survey.questions.length} 道题目</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">预计样本量</p>
                          <p className="font-medium">{sampleSize} 个角色</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">预计耗时</p>
                          <p className="font-medium">约 {Math.ceil(sampleSize / 5 * 3)} 秒</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">人群权重说明</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                          角色生成基于<strong className="text-foreground">第七次全国人口普查数据</strong>（2020年）的权重分布。
                        </p>
                        <p>
                          如不进行筛选，将按照真实人口比例生成代表性样本。
                        </p>
                        <p>
                          筛选后仍保持各维度内的相对权重比例。
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* 执行调研 Tab */}
              <TabsContent value="run">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* 左侧：调研信息 */}
                  <div className="lg:col-span-1 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">调研概览</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">问卷标题</p>
                          <p className="font-medium">{survey.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">问题数量</p>
                          <p className="font-medium">{survey.questions.length} 道题目</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">样本数量</p>
                          <p className="font-medium">{personas.length} 个角色</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">执行配置</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">模型</span>
                          <span className="font-medium text-xs">{llmModel || "默认模型"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">并发数</span>
                          <span className="font-medium">5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">重试次数</span>
                          <span className="font-medium">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">超时时间</span>
                          <span className="font-medium">60秒</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">温度参数</span>
                          <span className="font-medium">0.7</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("config")}
                    >
                      返回配置
                    </Button>
                  </div>

                  {/* 右侧：执行控制 */}
                  <div className="lg:col-span-2">
                    <SurveyRunner
                      personas={personas}
                      questions={survey.questions}
                      config={llmModel ? { model: llmModel } : undefined}
                      onComplete={handleComplete}
                    />
                  </div>
                </div>
              </TabsContent>

            <TabsContent value="results">
              {report ? (
                <>
                  <AnalysisDashboard
                    report={report}
                    onExport={() => setShowExportDialog(true)}
                  />
                  <ExportDialog
                    open={showExportDialog}
                    onOpenChange={setShowExportDialog}
                    report={report}
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <FileBarChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">暂无分析结果</p>
                    <p className="text-sm mt-1">请先执行调研后查看分析结果</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          </TooltipProvider>
        </motion.div>
      </motion.div>
    </>
  );
}
