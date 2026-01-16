"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Link2,
  Copy,
  Check,
  Loader2,
  Clock,
  Lock,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportReportToPDF,
  generateLocalShareLink,
  copyToClipboard,
  type ExportOptions,
  type ShareOptions,
} from "@/lib/export";
import type { AnalysisReport } from "@/lib/analysis";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AnalysisReport;
}

export function ExportDialog({ open, onOpenChange, report }: ExportDialogProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "share">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // PDF 导出选项
  const [pdfOptions, setPdfOptions] = useState<ExportOptions>({
    format: "a4",
    orientation: "portrait",
    quality: 2,
    includeTimestamp: true,
  });

  // 分享选项
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    expiresIn: 24,
    password: "",
    allowDownload: true,
  });

  // 导出 PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportReportToPDF(report, pdfOptions);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // 生成分享链接
  const handleGenerateShareLink = () => {
    setIsExporting(true);
    try {
      const link = generateLocalShareLink(report, shareOptions);
      setShareLink(link.url);
    } catch (error) {
      console.error("Share link generation failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    if (shareLink) {
      const success = await copyToClipboard(shareLink);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            导出报告
          </DialogTitle>
          <DialogDescription>
            将分析报告导出为 PDF 或生成分享链接
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pdf" | "share")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf" className="gap-2">
              <Download className="h-4 w-4" />
              导出 PDF
            </TabsTrigger>
            <TabsTrigger value="share" className="gap-2">
              <Link2 className="h-4 w-4" />
              分享链接
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>纸张格式</Label>
                  <Select
                    value={pdfOptions.format}
                    onValueChange={(v) =>
                      setPdfOptions({ ...pdfOptions, format: v as "a4" | "letter" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>方向</Label>
                  <Select
                    value={pdfOptions.orientation}
                    onValueChange={(v) =>
                      setPdfOptions({
                        ...pdfOptions,
                        orientation: v as "portrait" | "landscape",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">纵向</SelectItem>
                      <SelectItem value="landscape">横向</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>包含时间戳</Label>
                  <p className="text-xs text-muted-foreground">
                    在文件名中包含导出日期
                  </p>
                </div>
                <Switch
                  checked={pdfOptions.includeTimestamp}
                  onCheckedChange={(checked) =>
                    setPdfOptions({ ...pdfOptions, includeTimestamp: checked })
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "正在导出..." : "导出 PDF"}
            </Button>
          </TabsContent>

          <TabsContent value="share" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  有效期
                </Label>
                <Select
                  value={shareOptions.expiresIn?.toString()}
                  onValueChange={(v) =>
                    setShareOptions({
                      ...shareOptions,
                      expiresIn: v === "0" ? undefined : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 小时</SelectItem>
                    <SelectItem value="24">24 小时</SelectItem>
                    <SelectItem value="72">3 天</SelectItem>
                    <SelectItem value="168">7 天</SelectItem>
                    <SelectItem value="0">永不过期</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  访问密码（可选）
                </Label>
                <Input
                  type="password"
                  placeholder="留空则无需密码"
                  value={shareOptions.password || ""}
                  onChange={(e) =>
                    setShareOptions({ ...shareOptions, password: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>允许下载</Label>
                  <p className="text-xs text-muted-foreground">
                    访问者可以下载 PDF 报告
                  </p>
                </div>
                <Switch
                  checked={shareOptions.allowDownload}
                  onCheckedChange={(checked) =>
                    setShareOptions({ ...shareOptions, allowDownload: checked })
                  }
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {shareLink ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShareLink(null)}
                  >
                    生成新链接
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button
                    onClick={handleGenerateShareLink}
                    disabled={isExporting}
                    className="w-full gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    {isExporting ? "正在生成..." : "生成分享链接"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
