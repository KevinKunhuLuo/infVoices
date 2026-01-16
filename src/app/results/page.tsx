"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  FileBarChart,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveyRunner } from "@/components/survey";
import { AnalysisDashboard } from "@/components/dashboard";
import { ExportDialog } from "@/components/export";
import { generateAnalysisReport } from "@/lib/analysis";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { SurveyQuestion } from "@/lib/survey";
import type { Persona } from "@/lib/supabase";
import type { ResponseEntry } from "@/lib/survey/executor";
import type { AnalysisReport } from "@/lib/analysis";

// 示例问卷
const sampleQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    type: "single_choice",
    title: "您最常使用哪种社交媒体平台？",
    description: "请选择您日常使用最频繁的平台",
    required: true,
    order: 0,
    options: [
      { id: "opt1", value: "wechat", label: "微信" },
      { id: "opt2", value: "weibo", label: "微博" },
      { id: "opt3", value: "douyin", label: "抖音" },
      { id: "opt4", value: "xiaohongshu", label: "小红书" },
      { id: "opt5", value: "bilibili", label: "哔哩哔哩" },
    ],
  },
  {
    id: "q2",
    type: "scale",
    title: "您对当前使用的社交媒体平台满意度如何？",
    required: true,
    order: 1,
    scaleConfig: {
      min: 1,
      max: 5,
      minLabel: "非常不满意",
      maxLabel: "非常满意",
    },
  },
  {
    id: "q3",
    type: "multiple_choice",
    title: "您使用社交媒体的主要目的是什么？",
    description: "可多选",
    required: true,
    order: 2,
    options: [
      { id: "opt1", value: "social", label: "与朋友家人保持联系" },
      { id: "opt2", value: "news", label: "获取新闻资讯" },
      { id: "opt3", value: "entertainment", label: "娱乐消遣" },
      { id: "opt4", value: "shopping", label: "购物种草" },
      { id: "opt5", value: "work", label: "工作需要" },
      { id: "opt6", value: "learning", label: "学习知识" },
    ],
  },
  {
    id: "q4",
    type: "open_text",
    title: "您认为理想的社交媒体平台应该具备哪些特点？",
    description: "请自由表达您的想法",
    required: false,
    order: 3,
  },
];

// 示例角色数据
const samplePersonas: Persona[] = [
  {
    id: "p1",
    name: "张伟",
    gender: "男",
    ageRange: "25-34岁",
    cityTier: "一线城市",
    city: "北京",
    education: "本科",
    incomeLevel: "10000-20000元",
    occupation: "IT/互联网",
    familyStatus: "未婚",
    region: "华北",
    traits: ["理性务实", "追求效率"],
    biography: "北京互联网公司产品经理",
  },
  {
    id: "p2",
    name: "李娜",
    gender: "女",
    ageRange: "18-24岁",
    cityTier: "新一线城市",
    city: "成都",
    education: "本科",
    incomeLevel: "5000-10000元",
    occupation: "学生",
    familyStatus: "未婚",
    region: "西南",
    traits: ["活泼开朗", "追求新鲜感"],
    biography: "成都大学生，热爱追剧和美妆",
  },
  {
    id: "p3",
    name: "王芳",
    gender: "女",
    ageRange: "35-44岁",
    cityTier: "二线城市",
    city: "武汉",
    education: "大专",
    incomeLevel: "5000-10000元",
    occupation: "教育",
    familyStatus: "已婚有子女",
    region: "华中",
    traits: ["温和耐心", "重视家庭"],
    biography: "武汉中学教师，已婚有子女",
  },
  {
    id: "p4",
    name: "刘强",
    gender: "男",
    ageRange: "45-54岁",
    cityTier: "一线城市",
    city: "上海",
    education: "硕士及以上",
    incomeLevel: "20000元以上",
    occupation: "金融",
    familyStatus: "已婚有子女",
    region: "华东",
    traits: ["稳重成熟", "注重品质"],
    biography: "上海金融公司高管",
  },
  {
    id: "p5",
    name: "陈小红",
    gender: "女",
    ageRange: "25-34岁",
    cityTier: "新一线城市",
    city: "杭州",
    education: "本科",
    incomeLevel: "10000-20000元",
    occupation: "医疗健康",
    familyStatus: "未婚",
    region: "华东",
    traits: ["细心负责", "善于沟通"],
    biography: "杭州三甲医院护士",
  },
];

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<"run" | "results">("run");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // 处理执行完成
  const handleComplete = (completedResponses: ResponseEntry[]) => {

    // 生成分析报告
    const analysisReport = generateAnalysisReport(
      "demo-survey",
      "社交媒体使用习惯调研",
      sampleQuestions,
      completedResponses
    );

    setReport(analysisReport);
    setActiveTab("results");
  };

  // 重置
  const handleReset = () => {
    setReport(null);
    setActiveTab("run");
  };

  return (
      <motion.div
        className="container max-w-6xl py-8"
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
              <h1 className="text-2xl font-bold">调研执行与分析</h1>
              <p className="text-muted-foreground text-sm">
                执行调研并查看可视化分析结果
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
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "run" | "results")}
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid mb-6">
              <TabsTrigger value="run" className="gap-2">
                <Play className="h-4 w-4" />
                执行调研
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2" disabled={!report}>
                <FileBarChart className="h-4 w-4" />
                分析结果
              </TabsTrigger>
            </TabsList>

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
                        <p className="font-medium">社交媒体使用习惯调研</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">问题数量</p>
                        <p className="font-medium">{sampleQuestions.length} 道题目</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">样本数量</p>
                        <p className="font-medium">{samplePersonas.length} 个角色</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">执行配置</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
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
                </div>

                {/* 右侧：执行控制 */}
                <div className="lg:col-span-2">
                  <SurveyRunner
                    personas={samplePersonas}
                    questions={sampleQuestions}
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
        </motion.div>
      </motion.div>
  );
}
