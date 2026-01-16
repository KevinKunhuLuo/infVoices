/**
 * InfVoices PDF 导出器
 *
 * 将分析报告导出为 PDF 文档
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { AnalysisReport } from "@/lib/analysis";

export interface ExportOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  quality?: number;
  includeTimestamp?: boolean;
}

const DEFAULT_OPTIONS: Required<ExportOptions> = {
  filename: "survey-report",
  format: "a4",
  orientation: "portrait",
  quality: 2,
  includeTimestamp: true,
};

/**
 * 从 DOM 元素导出 PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 获取画布
  const canvas = await html2canvas(element, {
    scale: opts.quality,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // 计算 PDF 尺寸
  const pageWidth = opts.format === "a4" ? 210 : 216;
  const pageHeight = opts.format === "a4" ? 297 : 279;

  const imgWidth = pageWidth - 20; // 留出边距
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // 创建 PDF
  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit: "mm",
    format: opts.format,
  });

  // 添加图片
  const imgData = canvas.toDataURL("image/png");
  let heightLeft = imgHeight;
  let position = 10;

  // 添加第一页
  pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - 20;

  // 如果内容超过一页，添加更多页面
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;
  }

  // 生成文件名
  const timestamp = opts.includeTimestamp
    ? `_${new Date().toISOString().slice(0, 10)}`
    : "";
  const filename = `${opts.filename}${timestamp}.pdf`;

  // 下载
  pdf.save(filename);
}

/**
 * 转义 HTML 特殊字符以防止 XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 从分析报告生成 PDF 内容（使用安全的 DOM 方法）
 */
export function createReportElement(report: AnalysisReport): HTMLElement {
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}秒`;
    return `${Math.floor(ms / 60000)}分${Math.round((ms % 60000) / 1000)}秒`;
  };

  const typeLabels: Record<string, string> = {
    single_choice: "单选题",
    multiple_choice: "多选题",
    scale: "量表题",
    open_text: "开放题",
    image_compare: "图片对比",
    concept_test: "概念测试",
  };

  // 创建根容器
  const container = document.createElement("div");
  container.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    padding: 40px;
    background: #fff;
    width: 800px;
  `;

  // 添加样式
  const style = document.createElement("style");
  style.textContent = `
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #7c3aed; }
    .header h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; margin: 0; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; color: #7c3aed; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #f8f7ff; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #7c3aed; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    .question-card { background: #fafafa; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .question-title { font-weight: 600; margin-bottom: 12px; }
    .question-type { display: inline-block; font-size: 12px; background: #7c3aed; color: white; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; }
    .bar-chart { margin-top: 12px; }
    .bar-item { margin-bottom: 8px; }
    .bar-label { font-size: 14px; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .bar-track { height: 20px; background: #e5e5e5; border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #999; font-size: 12px; }
  `;
  container.appendChild(style);

  // 头部
  const header = document.createElement("div");
  header.className = "header";
  const h1 = document.createElement("h1");
  h1.textContent = report.surveyTitle;
  header.appendChild(h1);
  const headerP = document.createElement("p");
  headerP.textContent = `分析报告 · 生成于 ${new Date(report.generatedAt).toLocaleString("zh-CN")}`;
  header.appendChild(headerP);
  container.appendChild(header);

  // 执行摘要
  const summarySection = document.createElement("div");
  summarySection.className = "section";
  const summaryTitle = document.createElement("h2");
  summaryTitle.className = "section-title";
  summaryTitle.textContent = "执行摘要";
  summarySection.appendChild(summaryTitle);

  const statsGrid = document.createElement("div");
  statsGrid.className = "stats-grid";
  const stats = [
    { value: report.summary.totalResponses.toString(), label: "总样本数" },
    { value: `${report.summary.completionRate.toFixed(1)}%`, label: "完成率" },
    { value: formatTime(report.summary.averageResponseTime), label: "平均响应时间" },
    { value: `${(report.summary.averageConfidence * 100).toFixed(0)}%`, label: "平均置信度" },
  ];
  stats.forEach((stat) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    const value = document.createElement("div");
    value.className = "stat-value";
    value.textContent = stat.value;
    card.appendChild(value);
    const label = document.createElement("div");
    label.className = "stat-label";
    label.textContent = stat.label;
    card.appendChild(label);
    statsGrid.appendChild(card);
  });
  summarySection.appendChild(statsGrid);
  container.appendChild(summarySection);

  // 人口学分布
  const demoSection = document.createElement("div");
  demoSection.className = "section";
  const demoTitle = document.createElement("h2");
  demoTitle.className = "section-title";
  demoTitle.textContent = "人口学分布";
  demoSection.appendChild(demoTitle);

  report.demographics.slice(0, 4).forEach((demo) => {
    const card = document.createElement("div");
    card.className = "question-card";
    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = demo.label;
    card.appendChild(title);

    const chart = document.createElement("div");
    chart.className = "bar-chart";
    demo.segments.slice(0, 5).forEach((seg) => {
      const item = document.createElement("div");
      item.className = "bar-item";
      const label = document.createElement("div");
      label.className = "bar-label";
      const labelText = document.createElement("span");
      labelText.textContent = seg.label;
      label.appendChild(labelText);
      const labelValue = document.createElement("span");
      labelValue.textContent = `${seg.count} (${seg.percentage.toFixed(1)}%)`;
      label.appendChild(labelValue);
      item.appendChild(label);
      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${seg.percentage}%`;
      track.appendChild(fill);
      item.appendChild(track);
      chart.appendChild(item);
    });
    card.appendChild(chart);
    demoSection.appendChild(card);
  });
  container.appendChild(demoSection);

  // 问题分析
  const questionsSection = document.createElement("div");
  questionsSection.className = "section";
  const questionsTitle = document.createElement("h2");
  questionsTitle.className = "section-title";
  questionsTitle.textContent = "问题分析";
  questionsSection.appendChild(questionsTitle);

  report.questions.forEach((q) => {
    const card = document.createElement("div");
    card.className = "question-card";
    const type = document.createElement("span");
    type.className = "question-type";
    type.textContent = typeLabels[q.questionType] || q.questionType;
    card.appendChild(type);
    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = q.questionTitle;
    card.appendChild(title);
    const meta = document.createElement("p");
    meta.style.cssText = "font-size: 14px; color: #666; margin-bottom: 12px;";
    meta.textContent = `有效回答: ${q.validResponses} / ${q.totalResponses} · 置信度: ${(q.averageConfidence * 100).toFixed(0)}%`;
    card.appendChild(meta);

    const chart = document.createElement("div");
    chart.className = "bar-chart";
    q.distribution.slice(0, 6).forEach((d) => {
      const item = document.createElement("div");
      item.className = "bar-item";
      const label = document.createElement("div");
      label.className = "bar-label";
      const labelText = document.createElement("span");
      labelText.textContent = d.label;
      label.appendChild(labelText);
      const labelValue = document.createElement("span");
      labelValue.textContent = `${d.count} (${d.percentage.toFixed(1)}%)`;
      label.appendChild(labelValue);
      item.appendChild(label);
      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${d.percentage}%`;
      track.appendChild(fill);
      item.appendChild(track);
      chart.appendChild(item);
    });
    card.appendChild(chart);
    questionsSection.appendChild(card);
  });
  container.appendChild(questionsSection);

  // 页脚
  const footer = document.createElement("div");
  footer.className = "footer";
  const footerP1 = document.createElement("p");
  footerP1.textContent = "由 InfVoices (无穷声) 生成";
  footer.appendChild(footerP1);
  const footerP2 = document.createElement("p");
  footerP2.textContent = "AI 虚拟调研平台";
  footer.appendChild(footerP2);
  container.appendChild(footer);

  return container;
}

/**
 * 直接从报告数据导出 PDF
 */
export async function exportReportToPDF(
  report: AnalysisReport,
  options: ExportOptions = {}
): Promise<void> {
  // 使用安全的 DOM 方法创建报告元素
  const container = createReportElement(report);
  container.style.cssText += "position: absolute; left: -9999px; top: 0;";
  document.body.appendChild(container);

  try {
    await exportToPDF(container, {
      filename: `${report.surveyTitle}-分析报告`,
      ...options,
    });
  } finally {
    document.body.removeChild(container);
  }
}
