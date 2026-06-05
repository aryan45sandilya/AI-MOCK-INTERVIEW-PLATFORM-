"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bot, Volume2, VolumeX, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIInterviewerProps {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  onQuestionRead: () => void;
  isActive: boolean;
}

export function AIInterviewer({
  question,
  questionIndex,
  totalQuestions,
  onQuestionRead,
}: AIInterviewerProps) {
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dots, setDots] = useState(".");
  const spokenRef = useRef<Set<number>>(new Set());
  const onDoneRef = useRef(onQuestionRead);
  useEffect(() => { onDoneRef.current = onQuestionRead; }, [onQuestionRead]);

  // Animate dots while speaking
  useEffect(() => {
    if (!speaking) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(t);
  }, [speaking]);

  const doSpeak = useCallback(() => {
    if (spokenRef.current.has(questionIndex)) return;
    spokenRef.current.add(questionIndex);

    if (muted || !window.speechSynthesis) {
      setDone(true);
      onDoneRef.current();
      return;
    }

    window.speechSynthesis.cancel();
    const text = `Question ${questionIndex + 1} of ${totalQuestions}. ${question}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88;
    utter.pitch = 1;
    utter.volume = 1;

    // Pick best available English voice
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.name.includes("Google UK English Male")) ||
      voices.find(v => v.name.includes("Microsoft David")) ||
      voices.find(v => v.name.includes("Daniel") && v.lang.startsWith("en")) ||
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0];
    if (voice) utter.voice = voice;

    const finish = () => {
      setSpeaking(false);
      setDone(true);
      onDoneRef.current();
    };

    utter.onstart = () => setSpeaking(true);
    utter.onend = finish;
    utter.onerror = finish;

    window.speechSynthesis.speak(utter);

    // Fallback: unblock after 30s no matter what
    setTimeout(finish, 30000);
  }, [question, questionIndex, totalQuestions, muted]);

  // Reset when question changes
  useEffect(() => {
    setDone(false);
    setSpeaking(false);
  }, [questionIndex]);

  // Cleanup on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    if (next) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      if (!done) {
        setDone(true);
        onDoneRef.current();
      }
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      speaking ? "bg-blue-600/10 border-blue-500/40" : "bg-muted/40 border-border"
    )}>
      {/* Avatar */}
      <div className={cn(
        "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600",
        speaking && "ring-2 ring-blue-400 ring-offset-2 ring-offset-background"
      )}>
        <Bot className="h-6 w-6 text-white" />
        {speaking && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </span>
        )}
      </div>

      {/* Status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">AI Interviewer</p>
        <p className="text-xs">
          {speaking
            ? <span className="text-blue-500 font-medium">Reading question{dots}</span>
            : done
              ? <span className="text-green-500 font-medium">✓ Done — your turn to answer</span>
              : <span className="text-muted-foreground">Click to hear question {questionIndex + 1}</span>
          }
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {!done && !speaking && (
          <Button size="sm" variant="gradient" className="gap-1.5 h-8 text-xs" onClick={doSpeak}>
            <PlayCircle className="h-3.5 w-3.5" />
            Hear Question
          </Button>
        )}
        {done && !speaking && (
          <button onClick={() => {
            spokenRef.current.delete(questionIndex);
            setDone(false);
            setTimeout(doSpeak, 100);
          }} className="text-xs text-muted-foreground hover:text-foreground underline">
            Replay
          </button>
        )}
        <button onClick={handleMute} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          {muted
            ? <VolumeX className="h-4 w-4 text-muted-foreground" />
            : <Volume2 className="h-4 w-4 text-blue-500" />
          }
        </button>
      </div>
    </div>
  );
}
