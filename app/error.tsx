"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-red-50/10 dark:via-red-950/5 to-background p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        <div className="glass-card p-12 md:p-16 rounded-3xl shadow-2xl animate-fade-in">
          {/* Error Icon */}
          <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 mx-auto mb-8 shadow-2xl shadow-red-500/40 animate-pulse-slow">
            <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-white" />
          </div>

          {/* Message */}
          <div className="space-y-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Oops! Something Went Wrong
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
              {error.message || "An unexpected error occurred. Don't worry, let's try to fix it!"}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1.5 rounded-lg inline-block">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={reset}
              className="btn-hover bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 gap-2 shadow-2xl shadow-red-500/40 w-full sm:w-auto"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline" className="btn-hover gap-2 glass-card border-red-300/50 dark:border-red-600/50 w-full sm:w-auto">
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Decorative Element */}
          <div className="mt-12 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-red-500 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  );
}
