"use client";

import { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  horizontal?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  valueFormatter?: (value: number) => string;
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

// 自定义 Tooltip
const CustomTooltip = ({
  active,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { percentage?: number } }[];
  valueFormatter?: (value: number) => string;
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  const formattedValue = valueFormatter
    ? valueFormatter(data.value)
    : data.value.toString();

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm">{data.name}</p>
      <p className="text-muted-foreground text-sm">
        数值: <span className="font-medium text-foreground">{formattedValue}</span>
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

export function BarChartComponent({
  data,
  title,
  horizontal = false,
  showGrid = true,
  showLabels = false,
  valueFormatter,
  className,
}: BarChartProps) {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item, index) => ({
      ...item,
      fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 0);
  }, [data]);

  const height = horizontal ? Math.max(200, data.length * 40) : 280;

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="text-sm font-medium text-center mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {horizontal ? (
          <RechartsBarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
            )}
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              domain={[0, maxValue * 1.1]}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={valueFormatter} />}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              animationDuration={500}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              {showLabels && (
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value: unknown) =>
                    valueFormatter ? valueFormatter(value as number) : String(value)
                  }
                  className="text-xs fill-muted-foreground"
                />
              )}
            </Bar>
          </RechartsBarChart>
        ) : (
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            )}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              domain={[0, maxValue * 1.1]}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={valueFormatter} />}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              animationDuration={500}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              {showLabels && (
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value: unknown) =>
                    valueFormatter ? valueFormatter(value as number) : String(value)
                  }
                  className="text-xs fill-muted-foreground"
                />
              )}
            </Bar>
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
