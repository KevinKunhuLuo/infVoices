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

// 自定义标签
const renderCustomLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
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
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
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
  innerRadius = 0,
  className,
}: PieChartProps) {
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

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="text-sm font-medium text-center mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={100}
            paddingAngle={2}
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
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
