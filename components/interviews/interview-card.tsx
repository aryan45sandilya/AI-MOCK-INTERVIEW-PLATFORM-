"use client";

import Link from "next/link";
import { Clock, MessageSquare, BarChart2, Play, Eye, Trash2, MoreVertical } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatDate, formatScore, getDifficultyColor, getStatusColor, getInterviewTypeIcon } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InterviewCardProps {
  interview: {
    id: string;
    title: string;
    role: string;
    difficulty: string;
    interviewType: string;
    status: string;
    techStack?: string[] | null;
    overallScore?: number | null;
    duration?: number | null;
    createdAt: Date;
    _count?: { questions: number };
  };
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this interview? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/interviews/${interview.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Interview deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete interview");
    } finally {
      setDeleting(false);
    }
  };

  const isCompleted = interview.status === "completed";
  const isPending = interview.status === "pending";
  const isInProgress = interview.status === "in_progress";

  return (
    <Card className="card-hover flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{getInterviewTypeIcon(interview.interviewType)}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-1">{interview.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{interview.role}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCompleted && (
                <DropdownMenuItem asChild>
                  <Link href={`/interviews/${interview.id}/report`}>
                    <Eye className="h-4 w-4 mr-2" /> View Report
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={cn("text-xs", getDifficultyColor(interview.difficulty))} variant="outline">
            {interview.difficulty}
          </Badge>
          <Badge className={cn("text-xs", getStatusColor(interview.status))} variant="outline">
            {interview.status.replace("_", " ")}
          </Badge>
        </div>

        {interview.techStack && interview.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {interview.techStack.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
            ))}
            {interview.techStack.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{interview.techStack.length - 3}</Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {interview._count?.questions != null && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {interview._count.questions} questions
            </span>
          )}
          {isCompleted && interview.overallScore != null && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <BarChart2 className="h-3.5 w-3.5 text-primary" />
              {formatScore(interview.overallScore)}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">{formatDate(interview.createdAt)}</p>
      </CardContent>

      <CardFooter className="pt-0">
        {isCompleted ? (
          <Link href={`/interviews/${interview.id}/report`} className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Eye className="h-4 w-4" /> View Report
            </Button>
          </Link>
        ) : (
          <Link href={`/interviews/${interview.id}/room`} className="w-full">
            <Button
              variant={isInProgress ? "gradient" : "default"}
              size="sm"
              className="w-full gap-2"
            >
              <Play className="h-4 w-4" />
              {isInProgress ? "Continue" : "Start Interview"}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
