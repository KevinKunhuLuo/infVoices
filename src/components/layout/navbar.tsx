"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "项目",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "角色库",
    href: "/personas",
    icon: Users,
  },
  {
    label: "设置",
    href: "/settings",
    icon: Settings,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <header className="sticky top-0 z-50 w-full">
        {/* 背景模糊层 */}
        <div className="absolute inset-0 glass-strong border-b border-border/50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>

            {/* 桌面端导航链接 */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* 活跃状态背景 */}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-secondary rounded-lg"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    className="btn-gradient text-white gap-2 shadow-md hover:shadow-lg"
                  >
                    <Link href="/survey/new">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">新建调研</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>创建新的调研项目</p>
                </TooltipContent>
              </Tooltip>

              {/* 移动端菜单按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 glass-strong"
            >
              <nav className="px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </TooltipProvider>
  );
}
