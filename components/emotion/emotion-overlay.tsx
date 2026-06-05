"use client";

import { useEffect, useRef, useState, RefObject } from "react";
import { cn } from "@/lib/utils";

interface EmotionData {
  confidence: number;
  attention: number;
  eyeContact: number;
  stress: number;
  expression: string;
}

interface EmotionOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  interviewId: string;
}

function simulateEmotion(): EmotionData {
  return {
    confidence: 0.6 + Math.random() * 0.3,
    attention: 0.7 + Math.random() * 0.25,
    eyeContact: 0.65 + Math.random() * 0.3,
    stress: 0.2 + Math.random() * 0.3,
    expression: ["neutral", "focused", "thinking", "confident"][Math.floor(Math.random() * 4)],
  };
}

export function EmotionOverlay({ interviewId }: EmotionOverlayProps) {
  const [emotion, setEmotion] = useState<EmotionData>({
    confidence: 0.75,
    attention: 0.8,
    eyeContact: 0.7,
    stress: 0.25,
    expression: "neutral",
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // Update UI every 3s, but only send to API every 15s to reduce load
    let apiCounter = 0;
    intervalRef.current = setInterval(() => {
      const data = simulateEmotion();
      setEmotion(data);
      apiCounter++;
      if (apiCounter >= 5) {
        apiCounter = 0;
        fetch("/api/emotion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId, ...data }),
        }).catch(() => {});
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [interviewId]);

  const getBarColor = (val: number) =>
    val >= 0.7 ? "bg-green-500" : val >= 0.5 ? "bg-yellow-500" : "bg-red-500";
  const getTextColor = (val: number) =>
    val >= 0.7 ? "text-green-400" : val >= 0.5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-xs font-medium capitalize">{emotion.expression}</span>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Conf", value: emotion.confidence },
            { label: "Attn", value: emotion.attention },
            { label: "Eye", value: emotion.eyeContact },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="w-8 bg-black/40 rounded-sm h-1 mb-0.5">
                <div className={cn("h-full rounded-sm transition-all", getBarColor(m.value))}
                  style={{ width: `${m.value * 100}%` }} />
              </div>
              <span className={cn("text-[9px] font-mono", getTextColor(m.value))}>
                {Math.round(m.value * 100)}%
              </span>
              <p className="text-[9px] text-white/60">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
