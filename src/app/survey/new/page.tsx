"use client";

import { useRouter } from "next/navigation";
import { SurveyBuilder } from "@/components/survey";
import type { Survey } from "@/lib/survey";

export default function NewSurveyPage() {
  const router = useRouter();

  const handleSave = (survey: Survey) => {
    // TODO: 保存到数据库
    console.log("Survey saved:", survey);
    // 暂时存储到 localStorage
    const surveys = JSON.parse(localStorage.getItem("surveys") || "[]");
    surveys.push(survey);
    localStorage.setItem("surveys", JSON.stringify(surveys));
    // 跳转到项目页面
    router.push("/");
  };

  return (
    <SurveyBuilder
      projectId="demo-project-id"
      onSave={handleSave}
    />
  );
}
