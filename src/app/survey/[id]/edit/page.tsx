"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SurveyBuilder } from "@/components/survey";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Survey } from "@/lib/survey";

export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载问卷数据
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
    setLoading(false);
  }, [surveyId]);

  // 保存问卷
  const handleSave = (updatedSurvey: Survey) => {
    const savedSurveys = localStorage.getItem("surveys");
    if (savedSurveys) {
      try {
        const surveys = JSON.parse(savedSurveys);
        const index = surveys.findIndex((s: Survey) => s.id === surveyId);
        if (index !== -1) {
          surveys[index] = updatedSurvey;
        } else {
          surveys.push(updatedSurvey);
        }
        localStorage.setItem("surveys", JSON.stringify(surveys));
      } catch (e) {
        console.error("Failed to save survey:", e);
      }
    }
    // 返回问卷详情页
    router.push(`/survey/${surveyId}`);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-8 mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
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
    );
  }

  return (
    <SurveyBuilder
      initialSurvey={survey}
      projectId={survey.projectId}
      onSave={handleSave}
    />
  );
}
