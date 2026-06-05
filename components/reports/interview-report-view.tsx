"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Trophy, TrendingUp, MessageSquare, Target, Star, AlertCircle, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScoreChart } from "@/components/reports/score-chart";
import { cn, formatDate, getScoreColor } from "@/lib/utils";

function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}

interface ReportProps {
  interview: {
    id: string;
    title: string;
    role: string;
    interviewType: string;
    difficulty: string;
    duration?: number | null;
    completedAt?: Date | null;
    createdAt: Date;
  };
  report: {
    overallScore?: number | null;
    technicalScore?: number | null;
    communicationScore?: number | null;
    confidenceScore?: number | null;
    problemSolvingScore?: number | null;
    strengths?: string[] | null;
    weaknesses?: string[] | null;
    improvements?: string[] | null;
    detailedFeedback?: string | null;
    recommendations?: string[] | null;
    nextSteps?: string[] | null;
    questionBreakdown?: unknown;
    emotionSummary?: unknown;
  } | null;
  questionsWithAnswers: Array<{
    id: string;
    questionText: string;
    questionType: string;
    difficulty: string;
    orderIndex: number;
    answers: Array<{
      score?: number | null;
      feedback?: string | null;
      answerText?: string | null;
      timeTaken?: number | null;
      strengths?: string[] | null;
      improvements?: string[] | null;
    }>;
  }>;
}

export function InterviewReportView({ interview, report, questionsWithAnswers }: ReportProps) {
  const overallScore = report?.overallScore ?? 0;

  const getScoreLabel = (score: number) => {
    if (score >= 85) return { label: "Excellent", color: "text-green-500" };
    if (score >= 70) return { label: "Good", color: "text-blue-500" };
    if (score >= 55) return { label: "Average", color: "text-yellow-500" };
    return { label: "Needs Work", color: "text-red-500" };
  };

  const scoreLabel = getScoreLabel(overallScore);

  const scoreCategories = [
    { label: "Technical", value: report?.technicalScore ?? 0, icon: "💻" },
    { label: "Communication", value: report?.communicationScore ?? 0, icon: "🗣️" },
    { label: "Confidence", value: report?.confidenceScore ?? 0, icon: "💪" },
    { label: "Problem Solving", value: report?.problemSolvingScore ?? 0, icon: "🧠" },
  ];

  if (!report) {
    return (
      <div className="container py-20 text-center max-w-lg">
        <div className="glass-card p-12 rounded-3xl shadow-2xl animate-pulse-slow">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary mx-auto mb-6 shadow-2xl shadow-purple-500/40">
            <div className="h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          </div>
          <h2 className="text-2xl font-black mb-3 gradient-text">Generating Your Report</h2>
          <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
            AI is analyzing your answers with advanced algorithms. This takes 15–30 seconds.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>Page will refresh automatically...</span>
          </div>
        </div>
        <AutoRefresh />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/interviews">
            <Button variant="outline" size="icon" className="btn-hover glass-card rounded-xl h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black gradient-text">{interview.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {interview.role} • {formatDate(interview.completedAt || interview.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 btn-hover glass-card" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Overall Score Hero */}
      <Card className="glass-card border-2 border-purple-500/20 shadow-2xl overflow-hidden relative animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-cyan-600/10" />
        <CardContent className="pt-10 pb-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="text-center">
              <div className="relative flex h-36 w-36 md:h-40 md:w-40 items-center justify-center rounded-3xl border-4 border-purple-500/30 gradient-primary shadow-2xl shadow-purple-500/40 mx-auto group">
                <Trophy className={cn("h-12 w-12 md:h-14 md:w-14 text-white group-hover:scale-110 transition-transform")} />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl glass-card shadow-lg">
                  <span className={cn("text-4xl md:text-5xl font-black gradient-text")}>{Math.round(overallScore)}</span>
                </div>
              </div>
              <p className={cn("font-black text-xl md:text-2xl mt-10", scoreLabel.color)}>{scoreLabel.label}</p>
              <p className="text-sm text-muted-foreground font-semibold">Overall Score</p>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {scoreCategories.map((cat, i) => (
                <div key={cat.label} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span> {cat.label}
                    </span>
                    <span className={cn("text-lg font-black", getScoreColor(cat.value))}>
                      {Math.round(cat.value)}%
                    </span>
                  </div>
                  <Progress
                    value={cat.value}
                    className={cn(
                      "h-3 shadow-inner",
                      cat.value >= 70 ? "[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500" :
                        cat.value >= 50 ? "[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500" :
                          "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-500"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Detailed Feedback */}
          {report.detailedFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{report.detailedFeedback}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            {report.strengths && report.strengths.length > 0 && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Star className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weaknesses */}
            {report.weaknesses && report.weaknesses.length > 0 && (
              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <ScoreChart categories={scoreCategories} />
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="space-y-4 mt-4">
          {questionsWithAnswers.map((q, i) => {
            const answer = q.answers[0];
            const score = answer?.score ?? null;
            return (
              <Card key={q.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">Q{i + 1}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{q.questionType.replace("_", " ")}</Badge>
                      </div>
                      <p className="font-medium text-sm">{q.questionText}</p>
                    </div>
                    {score !== null && (
                      <div className="text-right shrink-0">
                        <span className={cn("text-2xl font-black", getScoreColor(score))}>{Math.round(score)}</span>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {answer && (
                  <CardContent className="space-y-3">
                    {answer.answerText && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Your Answer</p>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {answer.answerText}
                        </p>
                      </div>
                    )}
                    {answer.feedback && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">AI Feedback</p>
                        <p className="text-sm">{answer.feedback}</p>
                      </div>
                    )}
                    {score !== null && (
                      <Progress
                        value={score}
                        className={cn(
                          "h-1.5",
                          score >= 70 ? "[&>div]:bg-green-500" :
                            score >= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
                        )}
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Improvement Plan */}
        <TabsContent value="improvement" className="space-y-4 mt-4">
          {report.improvements && report.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Improvement Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {report.nextSteps && report.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" /> Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {report.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Link href="/interviews/new" className="flex-1">
          <Button variant="gradient" className="w-full gap-2">
            <Target className="h-4 w-4" /> Practice Again
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" /> View Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}
