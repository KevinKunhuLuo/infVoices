"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 28, text: "text-lg", gap: "gap-2" },
  md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { icon: 48, text: "text-2xl", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      {/* Logo Icon - 声波涟漪概念 */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.icon, height: config.icon }}
      >
        {/* 背景光晕 */}
        <div className="absolute inset-0 bg-gradient-brand rounded-full opacity-20 blur-sm" />

        {/* 主图标 */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full"
        >
          {/* 外圈涟漪 */}
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#gradient-ring-outer)"
            strokeWidth="1.5"
            fill="none"
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* 中圈涟漪 */}
          <motion.circle
            cx="24"
            cy="24"
            r="14"
            stroke="url(#gradient-ring-mid)"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: [0.5, 0.7, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />

          {/* 内圈实心 */}
          <circle cx="24" cy="24" r="8" fill="url(#gradient-core)" />

          {/* 中心亮点 */}
          <circle cx="22" cy="22" r="2" fill="white" opacity="0.6" />

          {/* 渐变定义 */}
          <defs>
            <linearGradient
              id="gradient-ring-outer"
              x1="4"
              y1="4"
              x2="44"
              y2="44"
            >
              <stop offset="0%" stopColor="oklch(0.65 0.2 285)" />
              <stop offset="100%" stopColor="oklch(0.55 0.18 245)" />
            </linearGradient>
            <linearGradient
              id="gradient-ring-mid"
              x1="10"
              y1="10"
              x2="38"
              y2="38"
            >
              <stop offset="0%" stopColor="oklch(0.6 0.22 280)" />
              <stop offset="100%" stopColor="oklch(0.5 0.2 260)" />
            </linearGradient>
            <linearGradient
              id="gradient-core"
              x1="16"
              y1="16"
              x2="32"
              y2="32"
            >
              <stop offset="0%" stopColor="oklch(0.55 0.22 285)" />
              <stop offset="50%" stopColor="oklch(0.5 0.2 265)" />
              <stop offset="100%" stopColor="oklch(0.52 0.18 245)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Logo 文字 */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-semibold tracking-tight text-gradient-brand",
              config.text
            )}
          >
            InfVoices
          </span>
          <span className="text-[0.65em] text-muted-foreground tracking-wider">
            无穷声
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Logo 加载动画变体
 */
export function LogoLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative w-16 h-16">
        {/* 多层涟漪动画 */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{
              scale: [0.5, 1.5],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}

        {/* 中心点 */}
        <motion.div
          className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-gradient-brand"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
