"use client";

import { motion } from "framer-motion";
import { Navbar } from "./navbar";
import { pageTransition } from "@/lib/motion";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 顶部渐变光晕 */}
        <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[80%] aspect-square bg-gradient-radial opacity-50" />

        {/* 右上角装饰圆 */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        {/* 左下角装饰圆 */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* 导航栏 */}
      <Navbar />

      {/* 主内容区域 */}
      <motion.main
        className="relative"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageTransition}
      >
        {children}
      </motion.main>

      {/* Toast 通知 */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
    </div>
  );
}
