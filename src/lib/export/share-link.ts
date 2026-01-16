/**
 * InfVoices 分享链接生成器
 *
 * 生成可分享的报告链接
 */

import type { AnalysisReport } from "@/lib/analysis";

export interface ShareOptions {
  expiresIn?: number; // 过期时间（小时）
  password?: string; // 访问密码
  allowDownload?: boolean; // 允许下载
}

export interface ShareLink {
  id: string;
  url: string;
  shortUrl?: string;
  expiresAt?: Date;
  hasPassword: boolean;
  createdAt: Date;
}

/**
 * 生成分享 ID
 */
function generateShareId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 压缩报告数据用于 URL 分享
 */
export function compressReportForUrl(report: AnalysisReport): string {
  // 简化报告数据
  const simplified = {
    t: report.surveyTitle,
    g: report.generatedAt,
    s: {
      t: report.summary.totalResponses,
      c: report.summary.completedResponses,
      f: report.summary.failedResponses,
      r: Math.round(report.summary.completionRate),
      a: Math.round(report.summary.averageResponseTime),
      n: Math.round(report.summary.averageConfidence * 100),
    },
    d: report.demographics.slice(0, 4).map((d) => ({
      l: d.label,
      s: d.segments.slice(0, 5).map((s) => ({
        l: s.label,
        c: s.count,
        p: Math.round(s.percentage),
      })),
    })),
    q: report.questions.map((q) => ({
      t: q.questionTitle,
      y: q.questionType,
      v: q.validResponses,
      n: Math.round(q.averageConfidence * 100),
      d: q.distribution.slice(0, 6).map((d) => ({
        l: d.label,
        c: d.count,
        p: Math.round(d.percentage),
      })),
    })),
  };

  // 转换为 JSON 并进行 base64 编码
  const json = JSON.stringify(simplified);
  return btoa(encodeURIComponent(json));
}

/**
 * 解压缩 URL 分享的报告数据
 */
export function decompressReportFromUrl(compressed: string): Partial<AnalysisReport> | null {
  try {
    const json = decodeURIComponent(atob(compressed));
    const data = JSON.parse(json);

    return {
      surveyTitle: data.t,
      generatedAt: data.g,
      summary: {
        totalResponses: data.s.t,
        completedResponses: data.s.c,
        failedResponses: data.s.f,
        completionRate: data.s.r,
        averageResponseTime: data.s.a,
        averageConfidence: data.s.n / 100,
      },
      demographics: data.d.map((d: { l: string; s: { l: string; c: number; p: number }[] }) => ({
        label: d.l,
        segments: d.s.map((s: { l: string; c: number; p: number }) => ({
          label: s.l,
          count: s.c,
          percentage: s.p,
        })),
      })),
      questions: data.q.map((q: { t: string; y: string; v: number; n: number; d: { l: string; c: number; p: number }[] }) => ({
        questionTitle: q.t,
        questionType: q.y,
        validResponses: q.v,
        averageConfidence: q.n / 100,
        distribution: q.d.map((d: { l: string; c: number; p: number }) => ({
          label: d.l,
          count: d.c,
          percentage: d.p,
        })),
      })),
    };
  } catch (error) {
    console.error("Failed to decompress report:", error);
    return null;
  }
}

/**
 * 生成分享链接（本地模式）
 */
export function generateLocalShareLink(
  report: AnalysisReport,
  options: ShareOptions = {}
): ShareLink {
  const shareId = generateShareId();
  const compressed = compressReportForUrl(report);

  // 存储到 localStorage
  const shareData = {
    id: shareId,
    data: compressed,
    expiresAt: options.expiresIn
      ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000).toISOString()
      : null,
    password: options.password || null,
    allowDownload: options.allowDownload ?? true,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(`infvoices_share_${shareId}`, JSON.stringify(shareData));

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/share/${shareId}`;

  return {
    id: shareId,
    url,
    expiresAt: shareData.expiresAt ? new Date(shareData.expiresAt) : undefined,
    hasPassword: !!options.password,
    createdAt: new Date(),
  };
}

/**
 * 获取分享的报告数据
 */
export function getSharedReport(shareId: string, password?: string): {
  success: boolean;
  report?: Partial<AnalysisReport>;
  allowDownload?: boolean;
  error?: string;
} {
  const stored = localStorage.getItem(`infvoices_share_${shareId}`);

  if (!stored) {
    return { success: false, error: "分享链接不存在或已过期" };
  }

  const shareData = JSON.parse(stored);

  // 检查是否过期
  if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
    localStorage.removeItem(`infvoices_share_${shareId}`);
    return { success: false, error: "分享链接已过期" };
  }

  // 检查密码
  if (shareData.password && shareData.password !== password) {
    return { success: false, error: "密码错误" };
  }

  const report = decompressReportFromUrl(shareData.data);

  if (!report) {
    return { success: false, error: "报告数据解析失败" };
  }

  return {
    success: true,
    report,
    allowDownload: shareData.allowDownload,
  };
}

/**
 * 删除分享链接
 */
export function deleteShareLink(shareId: string): boolean {
  const key = `infvoices_share_${shareId}`;
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    return true;
  }
  return false;
}

/**
 * 获取所有分享链接
 */
export function getAllShareLinks(): ShareLink[] {
  const links: ShareLink[] = [];
  const prefix = "infvoices_share_";

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      links.push({
        id: data.id,
        url: `${baseUrl}/share/${data.id}`,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        hasPassword: !!data.password,
        createdAt: new Date(data.createdAt),
      });
    }
  }

  return links.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText = "position: fixed; left: -9999px;";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
