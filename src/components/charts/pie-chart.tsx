"use client";

import { useMemo } from "react";
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

// 自定义标签
const renderCustomLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  } = props;

  // Handle potential undefined values
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

// 外部标签（显示数值）
const renderOuterLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    value,
    name,
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

  if (percent < 0.03) return null;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[11px] fill-muted-foreground"
    >
      {value}
    </text>
  );
};

// 自定义 Tooltip
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { percentage?: number } }[];
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

export function PieChartComponent({
  data,
  title,
  showLegend = true,
  showLabels = true,
  innerRadius: customInnerRadius,
  outerRadius: customOuterRadius,
  height: customHeight,
  size = "md",
  className,
}: PieChartProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const height = customHeight || sizeConfig.height;
  const outerRadius = customOuterRadius || sizeConfig.outerRadius;
  const innerRadius = customInnerRadius ?? sizeConfig.innerRadius;
  const baseLegendHeight = sizeConfig.legendHeight || 50;

  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }, [data]);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const dataWithPercentage = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [chartData, total]);

  // 计算图表区域高度（减去图例和标题）
  // 动态计算图例高度，每行约20px，最多显示3行
  const estimatedLegendRows = Math.min(Math.ceil(data.length / 3), 3);
  const legendHeight = showLegend ? Math.max(baseLegendHeight, estimatedLegendRows * 22) : 0;
  const titleHeight = title ? 24 : 0;
  const chartAreaHeight = height - legendHeight - titleHeight;
  const centerY = chartAreaHeight / 2;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {title && (
        <h3 className="text-sm font-medium text-center mb-1 truncate px-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height - titleHeight}>
        <RechartsPieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy={showLegend ? "45%" : "50%"}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={data.length > 1 ? 2 : 0}
            dataKey="value"
            nameKey="name"
            label={showLabels ? renderCustomLabel : false}
            labelLine={false}
            animationDuration={500}
            animationBegin={0}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="var(--background)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
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
              formatter={(value, entry) => {
                const item = dataWithPercentage.find(d => d.name === value);
                return (
                  <span className="text-xs text-muted-foreground">
                    {value} {item && <span className="font-medium text-foreground">({item.value})</span>}
                  </span>
                );
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
