"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Send,
  Loader2,
  MessageSquare,
  X,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Persona } from "@/lib/supabase";
import type { SurveyAnswer } from "@/lib/llm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface PersonaChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
  questionContext?: {
    questionTitle: string;
    answer: SurveyAnswer;
  };
}

export function PersonaChatDialog({
  open,
  onOpenChange,
  persona,
  questionContext,
}: PersonaChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 初始化欢迎消息
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getWelcomeMessage(persona, questionContext),
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open, persona, questionContext]);

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 聚焦输入框
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // 生成欢迎消息
  function getWelcomeMessage(
    persona: Persona,
    context?: { questionTitle: string; answer: SurveyAnswer }
  ): string {
    if (context) {
      const answerStr = formatAnswer(context.answer.answer);
      return `你好！我是${persona.name}，${persona.ageRange}，来自${persona.cityTier}，从事${persona.occupation}工作。

关于"${context.questionTitle}"这个问题，我选择了「${answerStr}」。

${context.answer.reasoning ? `我这样选择的原因是：${context.answer.reasoning}` : ""}

你有什么想问我的吗？`;
    }

    return `你好！我是${persona.name}，${persona.ageRange}，来自${persona.cityTier}，从事${persona.occupation}工作。

你可以问我任何关于这次调研回答的问题，或者了解一下我的看法和生活方式。`;
  }

  // 格式化答案
  function formatAnswer(answer: unknown): string {
    if (Array.isArray(answer)) {
      return answer.join("、");
    }
    if (typeof answer === "object" && answer !== null) {
      return JSON.stringify(answer);
    }
    return String(answer);
  }

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 调用 API 获取回复
      const response = await fetch("/api/llm/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          questionContext,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("请求失败");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "抱歉，我无法回答这个问题。",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "抱歉，出了点问题。请稍后再试。",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 重置对话
  const handleReset = () => {
    setMessages([]);
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getWelcomeMessage(persona, questionContext),
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        {/* 头部 */}
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">{persona.name}</DialogTitle>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>{persona.gender}</span>
                  <span>·</span>
                  <span>{persona.ageRange}</span>
                  <span>·</span>
                  <span>{persona.cityTier}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="重置对话"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {persona.traits && persona.traits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {persona.traits.slice(0, 4).map((trait) => (
                <Badge key={trait} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* 消息区域 */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 加载中 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-[44px] px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
