"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnswerTimerProps {
  durationSeconds?: number;
  active: boolean;
  onTimeUp: () => void;
}

export function AnswerTimer({ durationSeconds = 60, active, onTimeUp }: AnswerTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  const calledRef = useRef(false);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  // Reset when active becomes true
  useEffect(() => {
    if (active) {
      setRemaining(durationSeconds);
      calledRef.current = false;
    }
  }, [active, durationSeconds]);

  // Count down using setInterval — reliable
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          if (!calledRef.current) {
            calledRef.current = true;
            setTimeout(() => onTimeUpRef.current(), 0);
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]); // only re-run when active changes

  const isWarning = remaining <= 20;
  const isDanger = remaining <= 10;

  // SVG ring — drains from full to empty
  const r = 54;
  const circumference = 2 * Math.PI * r;
  // filled arc = remaining/total * circumference (drains as time passes)
  const filledArc = (remaining / durationSeconds) * circumference;

  const ringColor = isDanger ? "#ef4444" : isWarning ? "#f97316" : "#3b82f6";
  const textColor = isDanger ? "text-red-500" : isWarning ? "text-orange-500" : "text-foreground";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          {/* Draining arc */}
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filledArc} ${circumference}`}
            stroke={ringColor}
            style={{ transition: "stroke-dasharray 0.95s linear, stroke 0.3s" }}
          />
        </svg>
        {/* Number */}
        <div className="flex flex-col items-center z-10">
          <span className={cn("text-4xl font-black tabular-nums leading-none", textColor)}>
            {remaining}
          </span>
          <span className="text-xs text-muted-foreground mt-1">sec</span>
        </div>
      </div>
    </div>
  );
}
