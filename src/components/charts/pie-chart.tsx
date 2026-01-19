"use client";

import { useMemo, useState, useCallback } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  /** 使用外部标签线模式（适合小图表） */
  externalLabels?: boolean;
  /** 启用图例交互（点击隐藏/显示） */
  interactive?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DEFAULT_COLORS = [
  "oklch(70% 0.15 280)",
  "oklch(70% 0.15 230)",
  "oklch(70% 0.15 180)",
  "oklch(70% 0.15 150)",
  "oklch(70% 0.15 90)",
  "oklch(70% 0.15 30)",
  "oklch(70% 0.15 0)",
  "oklch(70% 0.15 330)",
];

// Size presets - increased heights to accommodate legends with multiple items
const SIZE_CONFIG = {
  sm: { height: 200, outerRadius: 50, innerRadius: 20, legendHeight: 60 },
  md: { height: 280, outerRadius: 75, innerRadius: 35, legendHeight: 50 },
  lg: { height: 340, outerRadius: 95, innerRadius: 45, legendHeight: 60 },
};

// 内部标签（饼图扇形内）
const renderInnerLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  } = props;

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number" ||
    typeof percent !== "number"
  ) {
    return null;
  }

  if (percent < 0.05) return null; // 小于5%不显示标签

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-semibold"
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// 外部标签（带连接线，显示名称和百分比）
const renderExternalLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
    fill,
  } = props;

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number" ||
    typeof percent !== "number"
  ) {
    return null;
  }

  if (percent < 0.03) return null; // 小于3%不显示

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 8;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? "start" : "end";

  // 截断过长的名称
  const displayName = typeof name === 'string' && name.length > 4
    ? name.substring(0, 4) + '..'
    : name;

  return (
    <text
      x={x}
      y={y}
      fill={fill as string || "currentColor"}
      textAnchor={textAnchor}
      dominantBaseline="central"
      className="text-[9px] font-medium"
    >
      {displayName} {(percent * 100).toFixed(0)}%
    </text>
  );
};

// 自定义 Tooltip
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { percentage?: number; hidden?: boolean } }[];
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm">{data.name}</p>
      <p className="text-muted-foreground text-sm">
        数量: <span className="font-medium text-foreground">{data.value}</span>
      </p>
      {data.payload.percentage !== undefined && (
        <p className="text-muted-foreground text-sm">
          占比:{" "}
          <span className="font-medium text-foreground">
            {data.payload.percentage.toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  );
};

// 自定义交互式图例项
interface LegendPayloadItem {
  value: string;
  color?: string;
  payload?: {
    value: number;
    hidden?: boolean;
    percentage?: number;
  };
}

const renderInteractiveLegend = (
  props: {
    payload?: LegendPayloadItem[];
  },
  hiddenItems: Set<string>,
  onToggle: (name: string) => void
) => {
  const { payload } = props;
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-2 pt-2">
      {payload.map((entry, index) => {
        const isHidden = hiddenItems.has(entry.value);
        return (
          <button
            key={`legend-${index}`}
            onClick={() => onToggle(entry.value)}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-all duration-200 rounded px-1.5 py-0.5",
              "hover:bg-muted/50",
              isHidden && "opacity-40 line-through"
            )}
            type="button"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-opacity"
              style={{
                backgroundColor: entry.color,
                opacity: isHidden ? 0.3 : 1
              }}
            />
            <span className="text-muted-foreground">
              {entry.value}
              {entry.payload?.value !== undefined && (
                <span className="font-medium text-foreground ml-1">
                  ({entry.payload.value})
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// 普通图例渲染
const renderStaticLegend = (value: string, entry: LegendPayloadItem) => {
  return (
    <span className="text-xs text-muted-foreground">
      {value}
      {entry.payload?.value !== undefined && (
        <span className="font-medium text-foreground ml-1">
          ({entry.payload.value})
        </span>
      )}
    </span>
  );
};

export function PieChartComponent({
  data,
  title,
  showLegend = true,
  showLabels = true,
  externalLabels = false,
  interactive = false,
  innerRadius: customInnerRadius,
  outerRadius: customOuterRadius,
  height: customHeight,
  size = "md",
  className,
}: PieChartProps) {
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const sizeConfig = SIZE_CONFIG[size];
  const height = customHeight || sizeConfig.height;
  const outerRadius = customOuterRadius || sizeConfig.outerRadius;
  const innerRadius = customInnerRadius ?? sizeConfig.innerRadius;
  const baseLegendHeight = sizeConfig.legendHeight || 50;

  // 切换隐藏/显示
  const handleToggle = useCallback((name: string) => {
    setHiddenItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        // 至少保留一个可见项
        if (next.size < data.length - 1) {
          next.add(name);
        }
      }
      return next;
    });
  }, [data.length]);

  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      hidden: hiddenItems.has(item.name),
    }));
  }, [data, hiddenItems]);

  // 只计算可见项的总数（用于百分比）
  const visibleTotal = useMemo(() => {
    return chartData
      .filter(item => !item.hidden)
      .reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const dataWithPercentage = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      // 隐藏项的值设为0，这样会从图表中消失
      displayValue: item.hidden ? 0 : item.value,
      percentage: visibleTotal > 0 && !item.hidden
        ? (item.value / visibleTotal) * 100
        : 0,
    }));
  }, [chartData, visibleTotal]);

  // 用于图表显示的数据（过滤掉隐藏项）
  const visibleData = useMemo(() => {
    return dataWithPercentage.filter(item => !item.hidden);
  }, [dataWithPercentage]);

  // 计算图表区域高度
  const estimatedLegendRows = Math.min(Math.ceil(data.length / 3), 3);
  const legendHeight = showLegend ? Math.max(baseLegendHeight, estimatedLegendRows * 22) : 0;
  const titleHeight = title ? 24 : 0;

  // 选择标签渲染函数
  const labelRenderer = externalLabels ? renderExternalLabel : renderInnerLabel;

  // 计算图表高度（交互模式下图例在外部）
  const chartHeight = interactive
    ? height - titleHeight - legendHeight
    : height - titleHeight;

  return (
    <div className={cn("w-full overflow-hidden", className)} style={{ height }}>
      {title && (
        <h3 className="text-xs font-medium text-center mb-0.5 truncate px-2 text-muted-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={chartHeight} className="overflow-hidden">
        <RechartsPieChart>
          <Pie
            data={visibleData}
            cx="50%"
            cy={showLegend && !interactive ? "42%" : "50%"}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={visibleData.length > 1 ? 2 : 0}
            dataKey="value"
            nameKey="name"
            label={showLabels ? labelRenderer : false}
            labelLine={externalLabels ? { stroke: 'var(--muted-foreground)', strokeWidth: 0.5 } : false}
            animationDuration={400}
            animationBegin={0}
          >
            {visibleData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="var(--background)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && !interactive && (
            <Legend
              verticalAlign="bottom"
              height={legendHeight}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: 8,
                paddingLeft: 8,
                paddingRight: 8,
                lineHeight: '1.8',
              }}
              formatter={(value, entry) => renderStaticLegend(value as string, entry as LegendPayloadItem)}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
      {/* 交互式图例（在图表外部渲染） */}
      {showLegend && interactive && (
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 px-1">
          {dataWithPercentage.map((item, index) => {
            const isHidden = hiddenItems.has(item.name);
            return (
              <button
                key={`legend-${index}`}
                onClick={() => handleToggle(item.name)}
                className={cn(
                  "flex items-center gap-1 text-[10px] transition-all duration-200 rounded px-1 py-0.5",
                  "hover:bg-muted/50",
                  isHidden && "opacity-40 line-through"
                )}
                type="button"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-opacity"
                  style={{
                    backgroundColor: item.fill,
                    opacity: isHidden ? 0.3 : 1
                  }}
                />
                <span className="text-muted-foreground truncate max-w-[60px]">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 迷你饼图组件 - 专为小空间设计
 * 使用外部标签，紧凑布局
 */
export function MiniPieChart({
  data,
  title,
  height = 140,
  interactive = true,
  className,
}: {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  height?: number;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <PieChartComponent
      data={data}
      title={title}
      height={height}
      outerRadius={Math.min(40, height / 3.5)}
      innerRadius={Math.min(18, height / 7)}
      showLegend={true}
      showLabels={true}
      externalLabels={true}
      interactive={interactive}
      size="sm"
      className={className}
    />
  );
}
