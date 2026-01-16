"use client";

import {
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Wallet,
  Globe,
  Calendar,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Persona } from "@/lib/supabase";

interface PersonaDetailSheetProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function PersonaDetailSheet({
  persona,
  open,
  onOpenChange,
}: PersonaDetailSheetProps) {
  if (!persona) return null;

  const avatarColor = getAvatarColor(persona);
  const extendedPersona = persona as Persona & { age?: number; monthlyIncome?: number };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px] overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            <Avatar className={cn("h-16 w-16", avatarColor)}>
              <AvatarFallback className="text-white text-xl font-medium">
                {persona.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">{persona.name}</SheetTitle>
              <p className="text-muted-foreground">
                {persona.gender} · {persona.ageRange}
                {extendedPersona.age && ` (${extendedPersona.age}岁)`}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 人设描述 */}
          {persona.biography && (
            <div className="relative">
              <Quote className="absolute -left-1 -top-1 h-6 w-6 text-muted-foreground/30" />
              <p className="text-muted-foreground italic pl-6">
                "{persona.biography}"
              </p>
            </div>
          )}

          <Separator />

          {/* 基本信息 */}
          <div>
            <h4 className="font-medium mb-4">基本信息</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={MapPin}
                label="所在城市"
                value={persona.city || "-"}
              />
              <InfoItem
                icon={Globe}
                label="城市等级"
                value={persona.cityTier}
              />
              <InfoItem
                icon={Globe}
                label="地域"
                value={persona.region}
              />
              <InfoItem
                icon={Briefcase}
                label="职业"
                value={persona.occupation}
              />
              <InfoItem
                icon={GraduationCap}
                label="学历"
                value={persona.education}
              />
              <InfoItem
                icon={Users}
                label="家庭状态"
                value={persona.familyStatus}
              />
              <InfoItem
                icon={Wallet}
                label="收入水平"
                value={persona.incomeLevel}
              />
              {extendedPersona.monthlyIncome && (
                <InfoItem
                  icon={Wallet}
                  label="月收入"
                  value={`¥${extendedPersona.monthlyIncome.toLocaleString()}`}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* 特点标签 */}
          {persona.traits && persona.traits.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">人物特点</h4>
              <div className="flex flex-wrap gap-2">
                {persona.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* 维度权重可视化 */}
          <div>
            <h4 className="font-medium mb-4">人群特征</h4>
            <div className="space-y-3">
              <DimensionBar
                label="城市发展"
                value={getCityTierValue(persona.cityTier)}
                color="bg-blue-500"
              />
              <DimensionBar
                label="收入水平"
                value={getIncomeLevelValue(persona.incomeLevel)}
                color="bg-emerald-500"
              />
              <DimensionBar
                label="教育程度"
                value={getEducationValue(persona.education)}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            此角色基于人口统计数据生成，用于模拟真实用户的回答偏好。
            实际调研中，AI 将基于此人设特征生成符合角色背景的回答。
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// 信息项组件
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// 维度条形图
function DimensionBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

// 辅助函数：城市等级转数值
function getCityTierValue(tier: string): number {
  const map: Record<string, number> = {
    "一线城市": 1.0,
    "新一线城市": 0.8,
    "二线城市": 0.6,
    "三线城市": 0.4,
    "四五线城市": 0.2,
  };
  return map[tier] || 0.5;
}

// 辅助函数：收入等级转数值
function getIncomeLevelValue(level: string): number {
  const map: Record<string, number> = {
    "高收入": 1.0,
    "中高收入": 0.75,
    "中等收入": 0.5,
    "低收入": 0.25,
  };
  return map[level] || 0.5;
}

// 辅助函数：教育程度转数值
function getEducationValue(edu: string): number {
  const map: Record<string, number> = {
    "研究生+": 1.0,
    "本科": 0.75,
    "大专": 0.5,
    "高中及以下": 0.25,
  };
  return map[edu] || 0.5;
}
