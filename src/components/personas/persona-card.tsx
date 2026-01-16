"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cardHover } from "@/lib/motion";
import type { Persona } from "@/lib/supabase";

interface PersonaCardProps {
  persona: Persona;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
  className?: string;
}

// 根据性别和年龄生成头像背景色
function getAvatarColor(persona: Persona): string {
  const colors = {
    male: [
      "bg-blue-500",
      "bg-indigo-500",
      "bg-cyan-500",
      "bg-teal-500",
    ],
    female: [
      "bg-pink-500",
      "bg-rose-500",
      "bg-purple-500",
      "bg-fuchsia-500",
    ],
  };

  const genderColors = persona.gender === "女" ? colors.female : colors.male;
  const index = persona.name.charCodeAt(0) % genderColors.length;
  return genderColors[index];
}

// 获取姓名首字
function getInitials(name: string): string {
  return name.charAt(0);
}

export function PersonaCard({
  persona,
  onClick,
  selected = false,
  compact = false,
  className,
}: PersonaCardProps) {
  const avatarColor = getAvatarColor(persona);

  if (compact) {
    return (
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        onClick={onClick}
        className={cn(
          "cursor-pointer",
          className
        )}
      >
        <Card
          className={cn(
            "card-elevated hover:card-elevated-hover transition-all",
            selected && "ring-2 ring-primary"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className={cn("h-10 w-10", avatarColor)}>
                <AvatarFallback className="text-white font-medium">
                  {getInitials(persona.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{persona.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {persona.ageRange} · {persona.city} · {persona.occupation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={cn(
        onClick && "cursor-pointer",
        className
      )}
    >
      <Card
        className={cn(
          "card-elevated hover:card-elevated-hover transition-all h-full",
          selected && "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-6">
          {/* 头部：头像和基本信息 */}
          <div className="flex items-start gap-4 mb-4">
            <Avatar className={cn("h-14 w-14", avatarColor)}>
              <AvatarFallback className="text-white text-lg font-medium">
                {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{persona.name}</h3>
              <p className="text-muted-foreground">
                {persona.gender} · {persona.ageRange}
              </p>
            </div>
          </div>

          {/* 属性列表 */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {persona.city} · {persona.cityTier}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{persona.occupation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{persona.education}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{persona.familyStatus}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{persona.incomeLevel}</span>
            </div>
          </div>

          {/* 人设描述 */}
          {persona.biography && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {persona.biography}
            </p>
          )}

          {/* 特点标签 */}
          {persona.traits && persona.traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {persona.traits.map((trait, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                >
                  {trait}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * 角色卡片骨架屏
 */
export function PersonaCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-28 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
