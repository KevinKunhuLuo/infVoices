"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("w-9 h-9", className)}
        disabled
      >
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative w-9 h-9 overflow-hidden",
        "hover:bg-secondary/80",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
