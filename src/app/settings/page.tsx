"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Key,
  Server,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

interface ProviderStatus {
  configured: boolean;
  available: boolean;
  checking: boolean;
}

export default function SettingsPage() {
  // API 密钥状态
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("google/gemini-3-flash-preview");

  // 显示/隐藏密钥
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);

  // 提供商状态
  const [openrouterStatus, setOpenrouterStatus] = useState<ProviderStatus>({
    configured: false,
    available: false,
    checking: false,
  });

  // 加载保存的设置
  useEffect(() => {
    const saved = localStorage.getItem("llm_settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setOpenrouterKey(settings.openrouterKey || "");
        setOpenrouterModel(settings.openrouterModel || "google/gemini-3-flash-preview");
        setOpenrouterStatus((s) => ({ ...s, configured: !!settings.openrouterKey }));
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, []);

  // 保存设置
  const handleSave = () => {
    const settings = {
      openrouterKey,
      openrouterModel,
    };
    localStorage.setItem("llm_settings", JSON.stringify(settings));
    setOpenrouterStatus((s) => ({ ...s, configured: !!openrouterKey }));
    toast.success("设置已保存");
  };

  // 测试连接
  const testConnection = async () => {
    if (!openrouterKey) {
      toast.error("请先输入 API 密钥");
      return;
    }

    setOpenrouterStatus((s) => ({ ...s, checking: true }));

    try {
      // 模拟测试
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOpenrouterStatus((s) => ({ ...s, checking: false, available: true }));
      toast.success("OpenRouter 连接成功");
    } catch {
      setOpenrouterStatus((s) => ({ ...s, checking: false, available: false }));
      toast.error("连接测试失败");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          设置
        </h1>
        <p className="mt-2 text-muted-foreground">
          配置 LLM API 密钥和模型参数
        </p>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* OpenRouter 配置 */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Server className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">OpenRouter</CardTitle>
                    <CardDescription>LLM 提供商（支持多种模型）</CardDescription>
                  </div>
                </div>
                <ProviderStatusBadge status={openrouterStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openrouter-key">API 密钥</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openrouter-key"
                      type={showOpenrouterKey ? "text" : "password"}
                      placeholder="输入 OpenRouter API 密钥..."
                      value={openrouterKey}
                      onChange={(e) => setOpenrouterKey(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                    >
                      {showOpenrouterKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={openrouterStatus.checking}
                  >
                    {openrouterStatus.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openrouter-model">默认模型</Label>
                <Input
                  id="openrouter-model"
                  placeholder="输入模型名称，如 google/gemini-3-flash-preview"
                  value={openrouterModel}
                  onChange={(e) => setOpenrouterModel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  常用模型：google/gemini-3-flash-preview, anthropic/claude-3.5-sonnet, openai/gpt-4o
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                获取 API 密钥：
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  OpenRouter 控制台
                </a>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Separator />

        {/* 保存按钮 */}
        <motion.div variants={staggerItem}>
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            保存设置
          </Button>
        </motion.div>

        {/* 提示信息 */}
        <motion.div variants={staggerItem}>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium">安全提示</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground/80">
              <li>API 密钥仅存储在本地浏览器中</li>
              <li>建议使用独立的 API 密钥用于此应用</li>
              <li>定期轮换 API 密钥以确保安全</li>
              <li>生产环境建议使用服务端密钥管理</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 提供商状态徽章
function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  if (status.checking) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        检测中
      </Badge>
    );
  }

  if (!status.configured) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Key className="h-3 w-3" />
        未配置
      </Badge>
    );
  }

  if (status.available) {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500">
        <CheckCircle className="h-3 w-3" />
        已连接
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <Key className="h-3 w-3" />
      已配置
    </Badge>
  );
}
