"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Server,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

interface ServerConfig {
  configured: boolean;
  defaultModel?: string;
}

export default function SettingsPage() {
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  // 用户本地设置
  const [userModel, setUserModel] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);

  // 加载服务端配置和本地设置
  useEffect(() => {
    // 加载服务端配置
    fetch("/api/llm/config")
      .then((res) => res.json())
      .then((data) => {
        setServerConfig(data);
      })
      .catch((e) => {
        console.error("Failed to load config:", e);
        setServerConfig({ configured: false });
      })
      .finally(() => {
        setLoading(false);
      });

    // 加载本地设置
    const saved = localStorage.getItem("llm_user_settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.model) {
          setUserModel(settings.model);
          setUseCustomModel(true);
        }
      } catch (e) {
        console.error("Failed to load local settings:", e);
      }
    }
  }, []);

  // 保存本地设置
  const handleSave = () => {
    if (useCustomModel && userModel.trim()) {
      localStorage.setItem("llm_user_settings", JSON.stringify({ model: userModel.trim() }));
      toast.success("已保存自定义模型设置");
    } else {
      localStorage.removeItem("llm_user_settings");
      setUserModel("");
      setUseCustomModel(false);
      toast.success("已恢复使用默认模型");
    }
  };

  // 测试连接
  const testConnection = async () => {
    setTesting(true);
    try {
      const testModel = useCustomModel && userModel.trim() ? userModel.trim() : undefined;
      const response = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: testModel }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`连接成功！使用模型: ${data.model}`);
      } else {
        toast.error(data.error || "连接测试失败");
      }
    } catch {
      toast.error("连接测试失败");
    } finally {
      setTesting(false);
    }
  };

  const currentModel = useCustomModel && userModel.trim()
    ? userModel.trim()
    : serverConfig?.defaultModel || "google/gemini-3-flash-preview";

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
          配置 LLM 模型参数
        </p>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* 服务状态 */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Server className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">OpenRouter 服务</CardTitle>
                    <CardDescription>LLM API 服务状态</CardDescription>
                  </div>
                </div>
                {loading ? (
                  <Badge variant="secondary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    加载中
                  </Badge>
                ) : serverConfig?.configured ? (
                  <Badge variant="default" className="gap-1 bg-emerald-500">
                    <CheckCircle className="h-3 w-3" />
                    已配置
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    未配置
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!loading && serverConfig?.configured && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">服务端默认模型</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {serverConfig.defaultModel}
                  </code>
                </div>
              )}
              {!loading && !serverConfig?.configured && (
                <p className="text-sm text-muted-foreground">
                  服务端未配置 API 密钥，请联系管理员
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 用户模型设置 */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">模型设置</CardTitle>
              <CardDescription>
                自定义你的 LLM 模型，留空则使用服务端默认值
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">自定义模型（可选）</Label>
                <Input
                  id="model"
                  placeholder={serverConfig?.defaultModel || "google/gemini-3-flash-preview"}
                  value={userModel}
                  onChange={(e) => {
                    setUserModel(e.target.value);
                    setUseCustomModel(!!e.target.value.trim());
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  常用模型：google/gemini-3-flash-preview, anthropic/claude-3.5-sonnet, openai/gpt-4o
                </p>
              </div>

              <div className="flex justify-between items-center py-2 bg-muted/50 rounded-lg px-3">
                <span className="text-sm text-muted-foreground">当前使用模型</span>
                <code className="text-sm font-medium">
                  {currentModel}
                </code>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  保存设置
                </Button>
                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={testing || !serverConfig?.configured}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 说明 */}
        <motion.div variants={staggerItem}>
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium">说明</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground/80">
              <li>自定义模型设置仅对当前浏览器有效</li>
              <li>清空输入框并保存可恢复使用默认模型</li>
              <li>可在 <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter Models</a> 查看可用模型列表</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
