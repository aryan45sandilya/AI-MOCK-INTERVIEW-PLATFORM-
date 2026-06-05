import { formatRelativeTime, getStatusColor, getInterviewTypeIcon } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  status: string;
  interviewType: string;
  overallScore?: number | null;
  createdAt: Date;
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">No interviews yet</p>
            <p className="text-xs text-muted-foreground/70">Your recent activity will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm rounded-lg p-4 transition-all duration-200 hover:border-purple-500/30 hover:shadow-sm hover:shadow-purple-500/10 group cursor-pointer"
        >
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative flex items-center justify-between gap-4">
            {/* Left: Icon + Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 text-2xl p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 group-hover:from-purple-500/15 group-hover:to-indigo-500/15 transition-colors">
                {getInterviewTypeIcon(activity.interviewType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
            </div>

            {/* Right: Score + Status */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {activity.overallScore != null && (
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {Math.round(activity.overallScore)}
                    <span className="text-xs text-muted-foreground/70">%</span>
                  </p>
                </div>
              )}
              <Badge 
                className={getStatusColor(activity.status)} 
                variant="outline"
              >
                {activity.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
