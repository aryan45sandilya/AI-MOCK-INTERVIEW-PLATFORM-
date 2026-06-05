import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  iconColor?: string;
  bgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = "text-purple-600 dark:text-purple-400",
  bgColor = "bg-gradient-to-br from-purple-500/10 to-indigo-500/10",
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500 rounded-lg" />
      
      <CardContent className="p-5 relative z-10">
        {/* Icon and Title Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide mb-1">
              {title}
            </p>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
            bgColor
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed mb-2">
            {description}
          </p>
        )}

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
