"use client";

import { useEffect, useRef, useState, RefObject, useCallback } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface FaceGuardProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onAutoEnd: () => void;
}

const MAX_WARNINGS = 3;
const COOLDOWN_MS = 7000;
const START_DELAY_MS = 8000;
const CHECK_MS = 2500;

export function FaceGuard({ videoRef, enabled, onAutoEnd }: FaceGuardProps) {
  const [warningCount, setWarningCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const countRef = useRef(0);
  const lastWarnRef = useRef(0);
  const endedRef = useRef(false);
  const refSnapshotRef = useRef<Uint8Array | null>(null);
  const calibCountRef = useRef(0);
  const badConsecutiveRef = useRef(0);

  const onAutoEndRef = useRef(onAutoEnd);
  useEffect(() => { onAutoEndRef.current = onAutoEnd; }, [onAutoEnd]);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const speak = useCallback((txt: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.rate = 1.1;
    window.speechSynthesis.speak(u);
  }, []);

  // ── Instant end (no warning count — immediate violation) ────────────────────
  const instantEnd = useCallback((reason: string) => {
    if (endedRef.current) return;
    stop();
    endedRef.current = true;
    speak(`Interview ended. ${reason}`);
    toast.error(`🚨 ${reason}`, { duration: 3000 });
    onAutoEndRef.current();
  }, [stop, speak]);

  // ── Warn (3 warnings → end) ──────────────────────────────────────────────────
  const warn = useCallback((msg: string) => {
    if (endedRef.current) return;
    const now = Date.now();
    if (now - lastWarnRef.current < COOLDOWN_MS) return;
    lastWarnRef.current = now;
    badConsecutiveRef.current = 0;

    countRef.current += 1;
    const n = countRef.current;
    setWarningCount(n);
    setBannerMsg(msg);
    setShowBanner(true);

    if (n >= MAX_WARNINGS) {
      stop();
      endedRef.current = true;
      speak("Warning 3. Interview is being ended now.");
      onAutoEndRef.current();
    } else {
      speak(`Warning ${n}. ${msg}`);
      setTimeout(() => setShowBanner(false), 5000);
    }
  }, [stop, speak]);

  // ── Tab/window visibility detection ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && !endedRef.current) {
        instantEnd("Tab switching or screen sharing detected.");
      }
    };

    // Detect window blur (switching to another app)
    const handleBlur = () => {
      if (!endedRef.current) {
        warn("Please keep the interview window active.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, instantEnd, warn]);

  // ── Audio monitoring (second voice detection) ────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    let audioStream: MediaStream | null = null;
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    // Baseline audio level during calibration
    let baselineLevel = 0;
    let calibSamples = 0;
    const MAX_CALIB = 10;

    const startAudio = async () => {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        sourceNode = audioCtx.createMediaStreamSource(audioStream);
        sourceNode.connect(analyser);

        const dataArr = new Uint8Array(analyser.frequencyBinCount);

        checkInterval = setInterval(() => {
          if (!analyser || endedRef.current) return;
          analyser.getByteFrequencyData(dataArr);
          const avg = dataArr.reduce((a, b) => a + b, 0) / dataArr.length;

          // Calibration phase
          if (calibSamples < MAX_CALIB) {
            baselineLevel = (baselineLevel * calibSamples + avg) / (calibSamples + 1);
            calibSamples++;
            return;
          }

          // If audio level is significantly above baseline = second voice
          // Candidate talking would be gradual; sudden spike = external voice
          if (avg > baselineLevel + 20 && avg > 15) {
            warn("Background voice or noise detected. Please ensure a quiet environment.");
          }
        }, 4000);
      } catch {
        // Microphone already in use or denied — skip audio monitoring
      }
    };

    // Start after calibration delay
    const t = setTimeout(startAudio, START_DELAY_MS + 2000);

    return () => {
      clearTimeout(t);
      if (checkInterval) clearInterval(checkInterval);
      if (sourceNode) sourceNode.disconnect();
      if (audioCtx) audioCtx.close().catch(() => {});
      if (audioStream) audioStream.getTracks().forEach(t => t.stop());
    };
  }, [enabled, warn]);

  // ── Frame snapshot helper ─────────────────────────────────────────────────────
  const captureSnapshot = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number): Uint8Array => {
    const { data } = ctx.getImageData(0, 0, W, H);
    const gray = new Uint8Array(W * H);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    return gray;
  }, []);

  // ── Face position check ───────────────────────────────────────────────────────
  const check = useCallback(() => {
    if (endedRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return;

    const canvas = canvasRef.current ?? (() => {
      const c = document.createElement("canvas");
      canvasRef.current = c;
      return c;
    })();

    const W = 80, H = 60;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, W, H);
    const current = captureSnapshot(ctx, W, H);

    // Calibration
    calibCountRef.current++;
    if (calibCountRef.current <= 4) {
      if (!refSnapshotRef.current) {
        refSnapshotRef.current = current;
      } else {
        const ref = refSnapshotRef.current;
        for (let i = 0; i < ref.length; i++) {
          ref[i] = Math.round(ref[i] * 0.7 + current[i] * 0.3);
        }
      }
      return;
    }

    const ref = refSnapshotRef.current!;
    let totalDiff = 0, centerDiff = 0, centerPx = 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const d = Math.abs(current[i] - ref[i]);
        totalDiff += d;
        if (x > W * 0.2 && x < W * 0.8 && y > H * 0.1 && y < H * 0.9) {
          centerDiff += d; centerPx++;
        }
      }
    }

    let brightness = 0;
    for (let i = 0; i < current.length; i++) brightness += current[i];
    const avgBrightness = brightness / current.length;
    const avgCenterDiff = centerDiff / centerPx;

    if (avgBrightness < 12) {
      badConsecutiveRef.current++;
      if (badConsecutiveRef.current >= 2) {
        warn("Camera appears blocked. Please ensure your face is visible.");
      }
      return;
    }

    // ── Multiple faces / second person detection ──────────────────────────────
    // Count bright distinct regions — multiple faces = multiple bright clusters
    const rows: number[] = new Array(H).fill(0);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const v = current[y * W + x];
        if (v > avgBrightness + 15) rows[y]++;
      }
    }
    // Count clusters of bright rows (each face = 1 cluster)
    let clusters = 0;
    let inCluster = false;
    for (const r of rows) {
      if (r > W * 0.25) {
        if (!inCluster) { clusters++; inCluster = true; }
      } else {
        inCluster = false;
      }
    }
    if (clusters >= 2) {
      instantEnd("Multiple faces detected in the camera. Interview terminated.");
      return;
    }

    // ── Face position check ───────────────────────────────────────────────────
    if (avgCenterDiff > 32) {
      badConsecutiveRef.current++;
      if (badConsecutiveRef.current >= 1) {
        warn("Please keep your face centered in the camera.");
      }
    } else {
      badConsecutiveRef.current = 0;
      if (avgCenterDiff < 20) {
        for (let i = 0; i < ref.length; i++) {
          ref[i] = Math.round(ref[i] * 0.98 + current[i] * 0.02);
        }
      }
    }
  }, [videoRef, captureSnapshot, warn, instantEnd]);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => {
      if (!endedRef.current) {
        intervalRef.current = setInterval(check, CHECK_MS);
      }
    }, START_DELAY_MS);
    return () => { clearTimeout(t); stop(); };
  }, [enabled, check, stop]);

  useEffect(() => () => stop(), [stop]);

  if (!enabled) return null;
  if (!showBanner) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-in">
      <div className="flex items-start gap-3 bg-orange-500 text-white px-5 py-4 rounded-xl shadow-2xl">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm">Warning {warningCount} of {MAX_WARNINGS}</p>
          <p className="text-xs opacity-90 mt-0.5">{bannerMsg}</p>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= warningCount ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <p className="text-xs opacity-75 mt-1">
            {MAX_WARNINGS - warningCount} warning{MAX_WARNINGS - warningCount !== 1 ? "s" : ""} left before interview ends
          </p>
        </div>
      </div>
    </div>
  );
}
