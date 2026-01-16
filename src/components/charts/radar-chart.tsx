"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface RadarChartProps {
  data: {
    dimension: string;
    value: number;
    fullMark?: number;
  }[];
  title?: string;
  color?: string;
  showLegend?: boolean;
  className?: string;
}

// 自定义 Tooltip
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { dimension: string; fullMark?: number } }[];
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm">{data.payload.dimension}</p>
      <p className="text-muted-foreground text-sm">
        得分: <span className="font-medium text-foreground">{data.value.toFixed(2)}</span>
        {data.payload.fullMark && (
          <span> / {data.payload.fullMark}</span>
        )}
      </p>
    </div>
  );
};

export function RadarChartComponent({
  data,
  title,
  color = "oklch(70% 0.15 280)",
  showLegend = false,
  className,
}: RadarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fullMark: item.fullMark || 5,
  }));

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="text-sm font-medium text-center mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="得分"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.4}
            animationDuration={500}
            animationBegin={0}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={() => (
                <span className="text-xs text-muted-foreground">平均得分</span>
              )}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
