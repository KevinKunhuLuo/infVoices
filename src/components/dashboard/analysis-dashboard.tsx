"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PieChartComponent,
  BarChartComponent,
  RadarChartComponent,
  StatCard,
  StatCardGrid,
  WordCloud,
} from "@/components/charts";
import { PersonaResponseDialog } from "./persona-response-dialog";
import { CrossAnalysisPanel } from "./cross-analysis-panel";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type {
  AnalysisReport,
  AnswerStatistics,
  ScaleStatistics,
  DemographicDimension,
} from "@/lib/analysis";
import { DEMOGRAPHIC_LABELS } from "@/lib/analysis";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { SurveyQuestion } from "@/lib/survey";

interface AnalysisDashboardProps {
  report: AnalysisReport;
  responses?: ResponseEntry[];
  questions?: SurveyQuestion[];
  onExport?: () => void;
}

export function AnalysisDashboard({ report, responses = [], questions = [], onExport }: AnalysisDashboardProps) {
  const [selectedDemographic, setSelectedDemographic] =
    useState<DemographicDimension>("gender");
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}秒`;
    return `${Math.floor(ms / 60000)}分${Math.round((ms % 60000) / 1000)}秒`;
  };

  // 获取当前人口学分布数据
  const currentDemographic = useMemo(() => {
    return report.demographics.find((d) => d.dimension === selectedDemographic);
  }, [report.demographics, selectedDemographic]);

  // 人口学图表数据
  const demographicChartData = useMemo(() => {
    if (!currentDemographic) return [];
    return currentDemographic.segments.map((s) => ({
      name: s.label,
      value: s.count,
      color: s.color,
    }));
  }, [currentDemographic]);

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* 标题栏 */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">{report.surveyTitle}</h1>
          <p className="text-muted-foreground text-sm">
            分析报告生成于{" "}
            {new Date(report.generatedAt).toLocaleString("zh-CN")}
          </p>
        </div>
        {onExport && (
          <Button onClick={onExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            导出报告
          </Button>
        )}
      </motion.div>

      {/* 摘要统计卡片 */}
      <motion.div variants={staggerItem}>
        <StatCardGrid columns={4}>
          <StatCard
            title="总样本数"
            value={report.summary.totalResponses}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="完成率"
            value={`${report.summary.completionRate.toFixed(1)}%`}
            subtitle={`${report.summary.completedResponses} 完成`}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="失败数"
            value={report.summary.failedResponses}
            icon={XCircle}
            color={report.summary.failedResponses > 0 ? "danger" : "default"}
          />
          <StatCard
            title="平均响应时间"
            value={formatTime(report.summary.averageResponseTime)}
            icon={Clock}
            color="default"
          />
        </StatCardGrid>
      </motion.div>

      {/* 主要内容区域 */}
      <motion.div variants={staggerItem}>
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="questions" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              问题分析
            </TabsTrigger>
            <TabsTrigger value="demographics" className="gap-2">
              <Users className="h-4 w-4" />
              人口分布
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              洞察
            </TabsTrigger>
          </TabsList>

          {/* 人口分布 */}
          <TabsContent value="demographics" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">样本人口学分布</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedDemographic}
                    onValueChange={(v) =>
                      setSelectedDemographic(v as DemographicDimension)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEMOGRAPHIC_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-md">
                    <Button
                      variant={chartType === "pie" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setChartType("pie")}
                    >
                      <PieChartIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartType === "bar" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setChartType("bar")}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedDemographic}-${chartType}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {chartType === "pie" ? (
                          <PieChartComponent
                            data={demographicChartData}
                            title={currentDemographic?.label}
                            size="lg"
                            showLabels={true}
                            interactive={true}
                          />
                        ) : (
                          <BarChartComponent
                            data={demographicChartData}
                            title={currentDemographic?.label}
                            horizontal
                            showLabels
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      详细数据
                    </h4>
                    {currentDemographic?.segments.map((segment, index) => (
                      <motion.div
                        key={segment.value}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="text-sm">{segment.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {segment.count}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {segment.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 所有人口学维度概览 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.demographics
                .filter((d) => d.dimension !== selectedDemographic)
                .slice(0, 5)
                .map((demo) => (
                  <Card key={demo.dimension} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{demo.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 overflow-hidden">
                      <div className="w-full overflow-hidden">
                        <PieChartComponent
                          data={demo.segments.map((s) => ({
                            name: s.label,
                            value: s.count,
                            color: s.color,
                          }))}
                          showLegend={true}
                          showLabels={false}
                          size="sm"
                          interactive={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* 问题分析 */}
          <TabsContent value="questions" className="space-y-4">
            {report.questions.map((questionStats, index) => {
              const question = questions.find(q => q.id === questionStats.questionId);
              return (
                <QuestionAnalysisCard
                  key={questionStats.questionId}
                  stats={questionStats}
                  question={question}
                  index={index}
                  responses={responses}
                />
              );
            })}
          </TabsContent>

          {/* 洞察 */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">关键洞察</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.insights && report.insights.length > 0 ? (
                    report.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>暂无自动生成的洞察</p>
                      <p className="text-sm mt-1">
                        收集更多数据后将自动分析生成洞察
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 置信度分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">回答置信度分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {(report.summary.averageConfidence * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      平均置信度
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${report.summary.averageConfidence * 100}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

// 问题分析卡片组件
function QuestionAnalysisCard({
  stats,
  question,
  index,
  responses = [],
}: {
  stats: AnswerStatistics;
  question?: SurveyQuestion;
  index: number;
  responses?: ResponseEntry[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<string | undefined>();
  const [showCrossAnalysis, setShowCrossAnalysis] = useState(false);

  const isScaleQuestion = stats.questionType === "scale";
  const scaleStats = isScaleQuestion ? (stats as ScaleStatistics) : null;

  // 判断是否可以显示交叉分析（选择题类型）
  const canShowCrossAnalysis =
    question &&
    (stats.questionType === "single_choice" || stats.questionType === "multiple_choice") &&
    responses.length > 0;

  const chartData = stats.distribution.map((d) => ({
    name: d.label,
    value: d.count,
    color: d.color,
  }));

  const questionTypeLabels: Record<string, string> = {
    single_choice: "单选题",
    multiple_choice: "多选题",
    scale: "量表题",
    open_text: "开放题",
    image_compare: "图片对比",
    concept_test: "概念测试",
  };

  const handleViewResponses = (answerValue?: string, answerLabel?: string) => {
    setSelectedAnswer(answerValue);
    setSelectedAnswerLabel(answerLabel);
    setDialogOpen(true);
  };

  const hasResponses = responses.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                {questionTypeLabels[stats.questionType] || stats.questionType}
              </Badge>
              <CardTitle className="text-base">{stats.questionTitle}</CardTitle>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-right text-sm text-muted-foreground">
                <p>{stats.validResponses} 有效回答</p>
                <p>置信度 {(stats.averageConfidence * 100).toFixed(0)}%</p>
              </div>
              <div className="flex items-center gap-2">
                {canShowCrossAnalysis && (
                  <Button
                    variant={showCrossAnalysis ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowCrossAnalysis(!showCrossAnalysis)}
                  >
                    <TrendingUp className="h-4 w-4" />
                    交叉分析
                    {showCrossAnalysis ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {hasResponses && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleViewResponses()}
                  >
                    <Eye className="h-4 w-4" />
                    查看明细
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 图表 */}
            <div>
              {stats.questionType === "concept_test" ? (
                <RadarChartComponent
                  data={stats.distribution.map((d) => ({
                    dimension: d.label,
                    value: d.percentage / 20, // 转换为5分制
                  }))}
                />
              ) : stats.questionType === "scale" ? (
                <BarChartComponent data={chartData} showLabels />
              ) : stats.questionType === "open_text" ? (
                <WordCloud
                  data={stats.distribution.map((d) => ({
                    text: d.label,
                    count: d.count,
                  }))}
                  maxWords={20}
                  colorScheme="gradient"
                />
              ) : (
                <PieChartComponent data={chartData} size="md" showLabels={true} interactive={true} />
              )}
            </div>

            {/* 统计信息 */}
            <div className="space-y-3">
              {scaleStats && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{scaleStats.mean.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">平均值</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{scaleStats.median}</p>
                    <p className="text-xs text-muted-foreground">中位数</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{scaleStats.mode}</p>
                    <p className="text-xs text-muted-foreground">众数</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">
                      {scaleStats.standardDeviation.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">标准差</p>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-medium text-muted-foreground">
                答案分布 {hasResponses && <span className="text-xs">(点击查看详情)</span>}
              </h4>
              <div className="space-y-2">
                {stats.distribution.slice(0, 6).map((item, i) => (
                  <button
                    key={item.value}
                    className={cn(
                      "w-full text-left rounded-lg transition-colors",
                      hasResponses && "hover:bg-muted/50 cursor-pointer p-2"
                    )}
                    onClick={() => hasResponses && handleViewResponses(item.value, item.label)}
                    disabled={!hasResponses}
                  >
                    <div className="flex items-center gap-3">
                      {/* 排名指示器 */}
                      <span className="text-xs text-muted-foreground w-4 shrink-0">
                        {i + 1}
                      </span>
                      {/* 主内容区 */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm truncate">{item.label}</span>
                          <span className="text-sm font-medium shrink-0">
                            {item.count} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 交叉分析面板 */}
      <AnimatePresence>
        {showCrossAnalysis && canShowCrossAnalysis && question && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <CrossAnalysisPanel question={question} responses={responses} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 个体回答详情弹窗 */}
      {hasResponses && (
        <PersonaResponseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          questionId={stats.questionId}
          questionTitle={stats.questionTitle}
          selectedAnswer={selectedAnswer}
          selectedAnswerLabel={selectedAnswerLabel}
          responses={responses}
        />
      )}
    </motion.div>
  );
}
