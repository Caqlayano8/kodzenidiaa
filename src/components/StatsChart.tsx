"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyStats } from "@/lib/types";

interface StatsChartProps {
  data: DailyStats[];
}

export default function StatsChart({ data }: StatsChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={10}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={10}
            domain={[40, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}%`, "Isabet"]}
            labelFormatter={(label) => `Tarih: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="accuracy"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorAccuracy)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
