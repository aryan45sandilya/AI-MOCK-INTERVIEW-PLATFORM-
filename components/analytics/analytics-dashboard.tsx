"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Interview {
  id: string;
  title: string;
  role: string;
  interviewType: string;
  difficulty: string;
  overallScore?: number | null;
  completedAt?: Date | null;
  createdAt: Date;
}

interface Report {
  id: string;
  overallScore?: number | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  confidenceScore?: number | null;
  problemSolvingScore?: number | null;
  createdAt: Date;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export function AnalyticsDashboard({
  interviews,
  reports,
}: {
  interviews: Interview[];
  reports: Report[];
}) {
  if (interviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium mb-2">No completed interviews yet</p>
        <p className="text-muted-foreground">Complete some interviews to see your analytics</p>
      </div>
    );
  }

  // Score history over time
  const scoreHistory = interviews
    .filter((i) => i.overallScore != null)
    .map((i) => ({
      date: formatDate(i.completedAt || i.createdAt),
      score: Math.round(i.overallScore!),
      role: i.role,
    }))
    .slice(0, 20)
    .reverse();

  // Average score
  const avgScore = Math.round(
    interviews.filter((i) => i.overallScore != null).reduce((sum, i) => sum + i.overallScore!, 0) /
      interviews.filter((i) => i.overallScore != null).length || 0
  );

  // Score trend
  const recentScores = scoreHistory.slice(-5).map((s) => s.score);
  const scoreTrend =
    recentScores.length >= 2
      ? recentScores[recentScores.length - 1] - recentScores[0]
      : 0;

  // By interview type
  const typeData = Object.entries(
    interviews.reduce((acc: Record<string, number[]>, i) => {
      if (!acc[i.interviewType]) acc[i.interviewType] = [];
      if (i.overallScore != null) acc[i.interviewType].push(i.overallScore);
      return acc;
    }, {})
  ).map(([type, scores]) => ({
    type: type.replace("_", " "),
    avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length || 0),
    count: scores.length,
  }));

  // Skill breakdown from reports
  const latestReport = reports[0];
  const skillData = latestReport
    ? [
        { skill: "Technical", score: Math.round(latestReport.technicalScore ?? 0) },
        { skill: "Communication", score: Math.round(latestReport.communicationScore ?? 0) },
        { skill: "Confidence", score: Math.round(latestReport.confidenceScore ?? 0) },
        { skill: "Problem Solving", score: Math.round(latestReport.problemSolvingScore ?? 0) },
      ]
    : [];

  // Difficulty distribution
  const diffCounts = interviews.reduce((acc: Record<string, number>, i) => {
    acc[i.difficulty] = (acc[i.difficulty] || 0) + 1;
    return acc;
  }, {});
  const diffData = Object.entries(diffCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Completed Interviews", value: interviews.length },
          { label: "Average Score", value: `${avgScore}%` },
          {
            label: "Score Trend",
            value: scoreTrend > 0 ? `+${Math.round(scoreTrend)}%` : scoreTrend < 0 ? `${Math.round(scoreTrend)}%` : "Stable",
            icon: scoreTrend > 0 ? TrendingUp : scoreTrend < 0 ? TrendingDown : Minus,
            color: scoreTrend > 0 ? "text-green-500" : scoreTrend < 0 ? "text-red-500" : "text-muted-foreground",
          },
          { label: "Roles Practiced", value: new Set(interviews.map((i) => i.role)).size },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-2xl font-bold ${m.color || ""}`}>{m.value}</p>
                  {Icon && <Icon className={`h-5 w-5 ${m.color}`} />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score History */}
      {scoreHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`${val}%`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Interview Type */}
        {typeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score by Interview Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                    formatter={(val: number) => [`${val}%`, "Avg Score"]}
                  />
                  <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Difficulty Distribution */}
        {diffData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Difficulty Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={diffData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                    {diffData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [val, "Interviews"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {diffData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{d.name}</span>
                    <Badge variant="secondary" className="text-xs">{d.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Latest Skills Breakdown */}
      {skillData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest Interview Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillData.map((s) => (
                <div key={s.skill}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{s.skill}</span>
                    <span className="text-sm font-bold">{s.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${s.score}%`,
                        backgroundColor: s.score >= 70 ? "#10b981" : s.score >= 50 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
