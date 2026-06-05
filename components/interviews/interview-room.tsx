"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mic, MicOff, Video, VideoOff, ChevronRight, ChevronLeft,
  CheckCircle2, Clock, Brain, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmotionOverlay } from "@/components/emotion/emotion-overlay";
import { CodeEditor } from "@/components/coding/code-editor";
import { AIInterviewer } from "@/components/interviews/ai-interviewer";
import { AnswerTimer } from "@/components/interviews/answer-timer";
import { FaceGuard } from "@/components/interviews/face-guard";
import { CountdownScreen } from "@/components/interviews/countdown-screen";
import { cn, formatDuration, getDifficultyColor } from "@/lib/utils";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  orderIndex: number;
  difficulty: string;
  hints?: string[] | null;
  codeTemplate?: string | null;
  programmingLanguage?: string | null;
}

interface Interview {
  id: string;
  title: string;
  role: string;
  interviewType: string;
  difficulty: string;
}

export function InterviewRoom({ interview, questions }: { interview: Interview; questions: Question[] }) {
  const router = useRouter();

  const [countdownDone, setCountdownDone] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [aiDone, setAiDone] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentIdx];
  const progress = (currentIdx / questions.length) * 100;
  const isLastQuestion = currentIdx === questions.length - 1;
  const isCodingQuestion = currentQuestion?.questionType === "coding";

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
      setMicOn(true);
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraOn(true);
        setMicOn(false);
      } catch {
        toast.error("Camera access denied. You can still type your answers.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setMicOn(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Re-attach stream to video element after countdown (element wasn't in DOM before)
  useEffect(() => {
    if (!countdownDone) return;
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    } else if (!streamRef.current) {
      // Camera not started yet — start it now
      startCamera();
    }
  }, [countdownDone, startCamera]);

  // Reset on question change
  useEffect(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setTimerActive(false);
    setAiDone(false);
    setShowHint(false);
    setTimerKey((k) => k + 1);
  }, [currentIdx]);

  // Browser speech recognition — continuous with auto-restart
  const startRecording = useCallback(() => {
    const API = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!API) {
      toast.info("Voice not supported in this browser. Please type your answer.");
      return;
    }

    const startRec = () => {
      if (!recognitionRef.current) return; // stopped intentionally
      try {
        const rec = new API();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (e: Event) => {
          const event = e as any;
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) text += event.results[i][0].transcript + " ";
          }
          if (text.trim()) {
            setAnswers((prev) => ({
              ...prev,
              [currentQuestion.id]: ((prev[currentQuestion.id] || "") + " " + text).trim(),
            }));
          }
        };

        rec.onerror = (e: Event) => {
          const err = (e as any).error;
          if (err === "not-allowed") {
            toast.error("Microphone permission denied. Please type your answer.");
            recognitionRef.current = null;
            setIsRecording(false);
          }
        };

        // Auto-restart on end (Chrome stops after ~60s of silence)
        rec.onend = () => {
          if (recognitionRef.current) {
            // Still supposed to be recording — restart
            setTimeout(() => {
              if (recognitionRef.current) {
                try { recognitionRef.current.start(); } catch { /* ignore */ }
              }
            }, 200);
          }
        };

        rec.start();
        recognitionRef.current = rec;
        setIsRecording(true);
      } catch (err) {
        console.warn("SpeechRecognition failed:", err);
      }
    };

    // Set a non-null sentinel so onend knows to restart
    recognitionRef.current = {} as any;
    startRec();
  }, [currentQuestion?.id]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Auto-start recording when AI finishes
  useEffect(() => {
    if (!aiDone) return;
    const t = setTimeout(() => startRecording(), 400);
    return () => clearTimeout(t);
  }, [aiDone, startRecording]);

  const handleQuestionRead = useCallback(() => {
    setAiDone(true);
    setTimerActive(true);
  }, []);

  const completeInterview = useCallback(async () => {
    stopRecording();
    // Fire complete API without waiting — navigate immediately
    fetch(`/api/interviews/${interview.id}/complete`, { method: "POST" }).catch(() => {});
    toast.success("Interview completed! Generating report...");
    router.push(`/interviews/${interview.id}/report`);
  }, [interview.id, router, stopRecording]);

  const submitCurrentAnswer = useCallback(() => {
    stopRecording();
    const answerText = answers[currentQuestion?.id];
    const codeAnswer = codeAnswers[currentQuestion?.id];
    // Fire and forget — never block navigation
    fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion?.id,
        interviewId: interview.id,
        answerText,
        codeAnswer,
        timeTaken: elapsed,
      }),
    }).catch(() => {});
  }, [answers, codeAnswers, currentQuestion, interview.id, elapsed, stopRecording]);

  const handleTimeUp = useCallback(() => {
    setTimerActive(false);
    toast.info("Time's up!");
    submitCurrentAnswer();
    if (isLastQuestion) completeInterview();
    else setCurrentIdx((i) => i + 1);
  }, [isLastQuestion, submitCurrentAnswer, completeInterview]);

  const handleAutoEnd = useCallback(() => {
    completeInterview();
  }, [completeInterview]);

  const goToNext = useCallback(() => {
    setTimerActive(false);
    if (!answers[currentQuestion?.id] && !codeAnswers[currentQuestion?.id]) {
      toast.warning("Please provide an answer before continuing");
      return;
    }
    submitCurrentAnswer();
    if (isLastQuestion) completeInterview();
    else setCurrentIdx((i) => i + 1);
  }, [answers, codeAnswers, currentQuestion, isLastQuestion, submitCurrentAnswer, completeInterview]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No questions found</h2>
          <p className="text-muted-foreground mb-4">Refresh in a moment.</p>
          <Button onClick={() => router.refresh()}>Refresh</Button>
        </Card>
      </div>
    );
  }

  if (!countdownDone) {
    return (
      <CountdownScreen
        interviewTitle={interview.title}
        totalQuestions={questions.length}
        onComplete={() => setCountdownDone(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/10 dark:via-purple-950/5 to-background">
      <FaceGuard videoRef={videoRef} enabled={cameraOn} onAutoEnd={handleAutoEnd} />

      {/* Top bar */}
      <div className="sticky top-0 z-40 glass-morphism shadow-lg">
        <div className="container flex items-center justify-between gap-4 max-w-7xl py-3 md:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl gradient-primary shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm md:text-base truncate">{interview.title}</p>
              <p className="text-xs text-muted-foreground">Question {currentIdx + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-mono font-bold">{formatDuration(elapsed)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-bold">REC</span>
              </div>
            )}
          </div>
        </div>
        <div className="container max-w-7xl px-4">
          <Progress value={progress} className="h-2 [&>div]:gradient-primary shadow-sm" />
        </div>
      </div>

      <div className="container py-6 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="animate-fade-in">
            <AIInterviewer
              question={currentQuestion.questionText}
              questionIndex={currentIdx}
              totalQuestions={questions.length}
              onQuestionRead={handleQuestionRead}
              isActive={true}
            />
          </div>

          <Card className="glass-card shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs font-bold", getDifficultyColor(currentQuestion.difficulty))} variant="outline">
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize font-semibold glass-card">
                  {currentQuestion.questionType.replace("_", " ")}
                </Badge>
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto btn-hover"
                    onClick={() => setShowHint(!showHint)}>
                    💡 {showHint ? "Hide" : "Hint"}
                  </Button>
                )}
              </div>
              <CardTitle className="text-lg md:text-xl leading-relaxed mt-3 font-bold">{currentQuestion.questionText}</CardTitle>
              {showHint && currentQuestion.hints && (
                <div className="mt-3 p-4 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30 animate-slide-down">
                  <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-2">💡 Hints:</p>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {currentQuestion.hints.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isCodingQuestion ? (
                <Tabs defaultValue="code">
                  <TabsList className="mb-3">
                    <TabsTrigger value="code" className="gap-1.5"><Code2 className="h-3.5 w-3.5" /> Code</TabsTrigger>
                    <TabsTrigger value="explain">Explanation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code">
                    <CodeEditor
                      language={currentQuestion.programmingLanguage || "javascript"}
                      defaultValue={currentQuestion.codeTemplate || "// Write your solution here\n"}
                      onChange={(val) => setCodeAnswers((p) => ({ ...p, [currentQuestion.id]: val || "" }))}
                      interviewId={interview.id}
                      questionId={currentQuestion.id}
                    />
                  </TabsContent>
                  <TabsContent value="explain">
                    <Textarea
                      placeholder="Explain your approach..."
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => setAnswers((p) => ({ ...p, [currentQuestion.id]: e.target.value }))}
                      className="min-h-[200px]"
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    placeholder={aiDone
                      ? "Speak your answer (voice recording active) or type here..."
                      : "Click 'Hear Question' above to start..."}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [currentQuestion.id]: e.target.value }))}
                    className="min-h-[200px]"
                  />
                  {isRecording && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                      Voice recording active — speak your answer
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={() => setCurrentIdx((i) => i - 1)}
              disabled={currentIdx === 0} className="gap-2 btn-hover glass-card">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button onClick={goToNext} disabled={submitting || completing}
              variant={isLastQuestion ? "gradient" : "default"} 
              className={cn("gap-2 btn-hover shadow-lg", isLastQuestion && "shadow-purple-500/30")}>
              {completing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Completing...
                </>
              ) : submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : isLastQuestion ? (
                <>
                  <CheckCircle2 className="h-5 w-5" /> Finish Interview
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4 md:space-y-6">
          <Card className="overflow-hidden glass-card shadow-2xl animate-slide-in-right">
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 aspect-video">
              {/* Always in DOM so srcObject assignment works */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-500",
                  cameraOn ? "opacity-100" : "opacity-0"
                )}
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm">
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Camera Off</p>
                  </div>
                </div>
              )}
              {cameraOn && <EmotionOverlay videoRef={videoRef} interviewId={interview.id} />}
            </div>
            <div className="p-4 bg-card/50 backdrop-blur-sm border-t flex items-center justify-center gap-4">
              <Button variant={micOn ? "secondary" : "outline"} size="icon" className="btn-hover h-12 w-12 rounded-xl"
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micOn));
                    setMicOn(!micOn);
                  }
                }}>
                {micOn ? <Mic className="h-5 w-5 text-green-500" /> : <MicOff className="h-5 w-5 text-red-500" />}
              </Button>
              <Button variant={cameraOn ? "secondary" : "outline"} size="icon" className="btn-hover h-12 w-12 rounded-xl"
                onClick={cameraOn ? stopCamera : startCamera}>
                {cameraOn ? <Video className="h-5 w-5 text-green-500" /> : <VideoOff className="h-5 w-5 text-red-500" />}
              </Button>
            </div>
          </Card>

          <Card className="p-5 flex flex-col items-center gap-3 glass-card shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm font-bold gradient-text">
              {timerActive ? "⏱️ Answer Time Remaining" : aiDone ? "✅ Timer Done" : "⏳ Waiting for AI..."}
            </p>
            <AnswerTimer key={timerKey} durationSeconds={60} active={timerActive} onTimeUp={handleTimeUp} />
            {!aiDone && (
              <p className="text-xs text-muted-foreground text-center">Click &quot;Hear Question&quot; to start timer</p>
            )}
          </Card>

          <Card className="glass-card shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Questions Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const answered = !!(answers[q.id] || codeAnswers[q.id]);
                  return (
                    <button key={q.id} onClick={() => setCurrentIdx(i)}
                      className={cn(
                        "h-10 w-full rounded-xl text-sm font-bold border-2 transition-all duration-300",
                        i === currentIdx 
                          ? "gradient-primary text-white border-purple-500 shadow-lg shadow-purple-500/30 scale-110"
                          : answered 
                            ? "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400 hover:scale-105"
                            : "bg-muted border-border hover:border-purple-500/50 hover:scale-105"
                      )}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center font-semibold">
                {Object.keys({ ...answers, ...codeAnswers }).length} / {questions.length} answered
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-primary text-white shadow-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-5">
              <p className="text-xs font-bold mb-3 flex items-center gap-2">
                💡 Quick Tips
              </p>
              <ul className="text-xs space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">•</span>
                  <span>Click &quot;Hear Question&quot; — AI reads it aloud</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">•</span>
                  <span>60 seconds to answer after AI finishes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">•</span>
                  <span>Voice records automatically — or type</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">•</span>
                  <span>3 face warnings = interview ends</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
