"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChartComponent } from "@/components/charts";
import { generateCrossAnalysis } from "@/lib/analysis";
import { DEMOGRAPHIC_LABELS } from "@/lib/analysis";
import type { SurveyQuestion } from "@/lib/survey";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { DemographicDimension, CrossAnalysis } from "@/lib/analysis";

interface CrossAnalysisPanelProps {
  question: SurveyQuestion;
  responses: ResponseEntry[];
}

// 获取每个分组中最高的选项
function getTopAnswer(row: CrossAnalysis["data"][0]) {
  if (row.answers.length === 0) return null;
  return row.answers.reduce((max, ans) =>
    ans.percentage > max.percentage ? ans : max
  );
}

export function CrossAnalysisPanel({
  question,
  responses,
}: CrossAnalysisPanelProps) {
  const [selectedDimension, setSelectedDimension] =
    useState<DemographicDimension>("gender");

  // 生成交叉分析数据
  const crossAnalysis = useMemo(() => {
    return generateCrossAnalysis(question, responses, selectedDimension);
  }, [question, responses, selectedDimension]);

  // 转换为图表数据格式（堆叠柱状图）
  const chartData = useMemo(() => {
    if (!crossAnalysis || crossAnalysis.data.length === 0) return [];

    // 获取所有答案选项
    const options = question.options || [];

    return crossAnalysis.data.map((row) => {
      const dataPoint: Record<string, unknown> = {
        name: row.segmentLabel,
        total: row.total,
      };

      row.answers.forEach((ans) => {
        dataPoint[ans.label] = ans.percentage;
        dataPoint[`${ans.label}_count`] = ans.count;
      });

      return dataPoint;
    });
  }, [crossAnalysis, question.options]);

  // 获取所有答案选项作为图表的数据键
  const dataKeys = useMemo(() => {
    return (question.options || []).map((opt) => opt.label);
  }, [question.options]);

  // 如果没有数据，显示空状态
  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>没有可用的响应数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            交叉分析
          </CardTitle>
          <Select
            value={selectedDimension}
            onValueChange={(v) => setSelectedDimension(v as DemographicDimension)}
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 分组对比表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                  {crossAnalysis.dimensionLabel}
                </th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                  样本数
                </th>
                {(question.options || []).map((opt) => (
                  <th
                    key={opt.value}
                    className="text-right py-2 px-2 font-medium text-muted-foreground"
                  >
                    {opt.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossAnalysis.data.map((row, index) => {
                const topAnswer = getTopAnswer(row);

                return (
                  <motion.tr
                    key={row.segment}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 pr-4 font-medium">{row.segmentLabel}</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">
                      {row.total}
                    </td>
                    {row.answers.map((ans) => {
                      const isTop = topAnswer?.value === ans.value;
                      return (
                        <td
                          key={ans.value}
                          className={cn(
                            "text-right py-2 px-2",
                            isTop && "font-medium text-primary"
                          )}
                        >
                          {ans.percentage.toFixed(1)}%
                          <span className="text-xs text-muted-foreground ml-1">
                            ({ans.count})
                          </span>
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 洞察提示 */}
        {crossAnalysis.data.length > 1 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">洞察: </span>
              {generateInsight(crossAnalysis, question)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 生成简单的洞察文本
function generateInsight(
  crossAnalysis: CrossAnalysis,
  question: SurveyQuestion
): string {
  if (crossAnalysis.data.length < 2) {
    return "需要更多分组数据才能生成洞察";
  }

  // 找出差异最大的选项
  let maxDiff = 0;
  let diffOption = "";
  let highGroup = "";
  let lowGroup = "";

  const options = question.options || [];

  options.forEach((opt) => {
    const percentages = crossAnalysis.data.map((row) => {
      const ans = row.answers.find((a) => a.value === opt.value);
      return { segment: row.segmentLabel, percentage: ans?.percentage || 0 };
    });

    if (percentages.length >= 2) {
      const sorted = [...percentages].sort((a, b) => b.percentage - a.percentage);
      const diff = sorted[0].percentage - sorted[sorted.length - 1].percentage;

      if (diff > maxDiff) {
        maxDiff = diff;
        diffOption = opt.label;
        highGroup = sorted[0].segment;
        lowGroup = sorted[sorted.length - 1].segment;
      }
    }
  });

  if (maxDiff > 10) {
    return `在「${diffOption}」选项上，${highGroup}比${lowGroup}高出约${maxDiff.toFixed(0)}个百分点，存在显著差异。`;
  }

  return `各${crossAnalysis.dimensionLabel}分组在选项分布上较为均匀，无显著差异。`;
}
