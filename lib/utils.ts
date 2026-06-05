import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "N/A";
  return `${Math.round(score)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBadgeVariant(
  score: number
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "text-green-500 bg-green-500/10";
    case "medium":
      return "text-yellow-500 bg-yellow-500/10";
    case "hard":
      return "text-red-500 bg-red-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
}

export function getInterviewTypeIcon(type: string): string {
  switch (type) {
    case "technical":
      return "💻";
    case "hr":
      return "🤝";
    case "behavioral":
      return "🧠";
    case "system_design":
      return "🏗️";
    case "coding":
      return "⌨️";
    case "mixed":
      return "🎯";
    default:
      return "📝";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-green-500 bg-green-500/10";
    case "in_progress":
      return "text-blue-500 bg-blue-500/10";
    case "pending":
      return "text-yellow-500 bg-yellow-500/10";
    case "cancelled":
      return "text-red-500 bg-red-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function generateInterviewTitle(role: string, type: string): string {
  return `${type.charAt(0).toUpperCase() + type.slice(1)} Interview - ${role}`;
}

export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function parseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
