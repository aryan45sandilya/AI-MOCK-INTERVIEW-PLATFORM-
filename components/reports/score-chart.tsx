"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreChartProps {
  categories: { label: string; value: number; icon: string }[];
}

export function ScoreChart({ categories }: ScoreChartProps) {
  const data = categories.map((c) => ({
    subject: c.label,
    score: Math.round(c.value),
    fullMark: 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data}>
            <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(val: number) => [`${val}%`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
