"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  Users,
  SlidersHorizontal,
  Hash,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PersonaCard, PersonaCardSkeleton } from "@/components/personas/persona-card";
import { PersonaDetailSheet } from "@/components/personas/persona-detail-sheet";
import {
  generatePersonas,
  allDimensions,
  audiencePresets,
  getDataSourceNotes,
  detectFilterConflicts,
} from "@/lib/personas";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import type { Persona, DimensionConfig } from "@/lib/supabase";

// 可配置的角色数量选项
const PERSONA_COUNT_OPTIONS = [12, 24, 48, 96];
const DEFAULT_PERSONA_COUNT = 24;

// 数据来源说明
const dataSourceNotes = getDataSourceNotes();
const confidenceLabels: Record<string, { label: string; color: string }> = {
  high: { label: "✓ 高可信度", color: "text-green-600" },
  medium: { label: "~ 中等可信度", color: "text-yellow-600" },
  low: { label: "○ 低可信度", color: "text-orange-600" },
};

export default function PersonasPage() {
  // 状态
  const [personaCount, setPersonaCount] = useState<number>(DEFAULT_PERSONA_COUNT);
  const [personas, setPersonas] = useState<Persona[]>(() =>
    generatePersonas(DEFAULT_PERSONA_COUNT)
  );
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("default");
  const [filters, setFilters] = useState<DimensionConfig>({});
  const [showDataSources, setShowDataSources] = useState(false);

  // 筛选后的角色列表
  const filteredPersonas = useMemo(() => {
    if (!searchQuery) return personas;

    const query = searchQuery.toLowerCase();
    return personas.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.occupation.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query)
    );
  }, [personas, searchQuery]);

  // 检测筛选条件冲突
  const filterConflicts = useMemo(() => {
    return detectFilterConflicts(filters as Record<string, string[]>);
  }, [filters]);

  // 重新生成角色
  const handleRegenerate = () => {
    setIsLoading(true);

    // 模拟加载延迟
    setTimeout(() => {
      const preset = audiencePresets.find((p) => p.id === selectedPreset);
      const config = preset?.dimensions || filters;
      setPersonas(generatePersonas(personaCount, config));
      setIsLoading(false);
    }, 500);
  };

  // 更改角色数量
  const handleCountChange = (count: number) => {
    setPersonaCount(count);
    setIsLoading(true);

    setTimeout(() => {
      const preset = audiencePresets.find((p) => p.id === selectedPreset);
      const config = preset?.dimensions || filters;
      setPersonas(generatePersonas(count, config));
      setIsLoading(false);
    }, 500);
  };

  // 应用预设
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    setIsLoading(true);

    setTimeout(() => {
      const preset = audiencePresets.find((p) => p.id === presetId);
      if (preset) {
        setFilters(preset.dimensions);
        setPersonas(generatePersonas(personaCount, preset.dimensions));
      } else {
        setFilters({});
        setPersonas(generatePersonas(personaCount));
      }
      setIsLoading(false);
    }, 500);
  };

  // 查看角色详情
  const handleViewDetail = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDetailOpen(true);
  };

  // 更新筛选条件
  const handleFilterChange = (dimensionId: string, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [dimensionId]: values.length > 0 ? values : undefined,
    }));
  };

  // 应用筛选
  const applyFilters = () => {
    setIsLoading(true);
    setIsFilterOpen(false);
    setSelectedPreset("");

    setTimeout(() => {
      setPersonas(generatePersonas(personaCount, filters));
      setIsLoading(false);
    }, 500);
  };

  // 清除筛选
  const clearFilters = () => {
    setFilters({});
    setSelectedPreset("");
  };

  // 计算当前活跃的筛选数量
  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v.length > 0
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              角色库
            </h1>
            <p className="mt-2 text-muted-foreground">
              浏览和探索虚拟人口角色，了解不同人群的特征
            </p>
          </div>
        </div>
      </motion.div>

      {/* 工具栏 */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名、城市、职业..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 角色数量选择 */}
        <Select value={personaCount.toString()} onValueChange={(v) => handleCountChange(parseInt(v, 10))}>
          <SelectTrigger className="w-[120px]">
            <Hash className="h-4 w-4 mr-1" />
            <SelectValue placeholder="数量" />
          </SelectTrigger>
          <SelectContent>
            {PERSONA_COUNT_OPTIONS.map((count) => (
              <SelectItem key={count} value={count.toString()}>
                {count} 个角色
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 预设选择 */}
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="选择场景预设" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">全国代表性样本</SelectItem>
            <Separator className="my-1" />
            {audiencePresets.slice(1).map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 筛选按钮 */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              筛选
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>筛选条件</SheetTitle>
              <SheetDescription>
                选择维度条件来筛选特定人群
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-6 mt-6 space-y-6">
              {allDimensions.map((dimension) => (
                <div key={dimension.id}>
                  <label className="text-sm font-medium mb-2 block">
                    {dimension.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dimension.options.map((option) => {
                      const currentValues =
                        (filters as Record<string, string[]>)[dimension.id] || [];
                      const isSelected = currentValues.includes(option.value);

                      return (
                        <Badge
                          key={option.value}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected && "bg-primary"
                          )}
                          onClick={() => {
                            const newValues = isSelected
                              ? currentValues.filter((v) => v !== option.value)
                              : [...currentValues, option.value];
                            handleFilterChange(dimension.id, newValues);
                          }}
                        >
                          {option.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* 冲突警告 */}
              {filterConflicts.length > 0 && (
                <div className="space-y-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      检测到 {filterConflicts.filter(c => c.type === 'impossible').length} 个冲突
                    </span>
                  </div>
                  <ul className="text-xs text-amber-600 dark:text-amber-500 space-y-1">
                    {filterConflicts.slice(0, 3).map((conflict, i) => (
                      <li key={i}>• {conflict.message}</li>
                    ))}
                    {filterConflicts.length > 3 && (
                      <li className="text-muted-foreground">
                        还有 {filterConflicts.length - 3} 个冲突...
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    冲突的筛选条件会导致生成结果不符合预期
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  清除
                </Button>
                <Button className="flex-1" onClick={applyFilters}>
                  应用筛选
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* 重新生成按钮 */}
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleRegenerate}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("h-4 w-4", isLoading && "animate-spin")}
          />
          重新生成
        </Button>
      </motion.div>

      {/* 当前筛选条件展示 */}
      {(selectedPreset || activeFilterCount > 0) && (
        <motion.div
          className="flex items-center gap-2 mb-6 flex-wrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm text-muted-foreground">当前筛选：</span>
          {selectedPreset && (
            <Badge variant="secondary">
              {audiencePresets.find((p) => p.id === selectedPreset)?.name}
            </Badge>
          )}
          {!selectedPreset &&
            Object.entries(filters).map(([dimId, values]) => {
              if (!values || values.length === 0) return null;
              const dimension = allDimensions.find((d) => d.id === dimId);
              return (values as string[]).map((value) => {
                const option = dimension?.options.find(
                  (o) => o.value === value
                );
                return (
                  <Badge key={`${dimId}-${value}`} variant="secondary">
                    {option?.label || value}
                  </Badge>
                );
              });
            })}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-muted-foreground"
            onClick={clearFilters}
          >
            清除全部
          </Button>
        </motion.div>
      )}

      {/* 角色卡片网格 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <PersonaCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {filteredPersonas.map((persona) => (
            <motion.div key={persona.id} variants={staggerItem}>
              <PersonaCard
                persona={persona}
                onClick={() => handleViewDetail(persona)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 空状态 */}
      {!isLoading && filteredPersonas.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">没有找到匹配的角色</h3>
          <p className="text-muted-foreground mb-4">
            尝试调整搜索条件或筛选条件
          </p>
          <Button variant="outline" onClick={clearFilters}>
            清除筛选
          </Button>
        </motion.div>
      )}

      {/* 角色详情抽屉 */}
      <PersonaDetailSheet
        persona={selectedPersona}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* 数据来源说明 */}
      <motion.div
        className="mt-12 border-t pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => setShowDataSources(!showDataSources)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="h-4 w-4" />
          <span>数据来源与可信度说明</span>
          {showDataSources ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showDataSources && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Object.entries(dataSourceNotes).map(([key, info]) => {
              const confidenceInfo = confidenceLabels[info.confidence];
              return (
                <div
                  key={key}
                  className="p-3 rounded-lg border bg-muted/30 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {allDimensions.find(d => d.id === key)?.name || key}
                    </span>
                    <span className={cn("text-xs", confidenceInfo.color)}>
                      {confidenceInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{info.source}</p>
                  {info.note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {info.note}
                    </p>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
