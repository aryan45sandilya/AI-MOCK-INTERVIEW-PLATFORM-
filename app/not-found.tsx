import Link from "next/link";
import { ArrowLeft, Home, Search, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-purple-50/20 dark:via-purple-950/10 to-background p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        <div className="glass-card p-12 md:p-16 rounded-3xl shadow-2xl animate-fade-in">
          {/* Logo */}
          <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl gradient-primary mx-auto mb-8 shadow-2xl shadow-purple-500/40">
            <Brain className="h-10 w-10 md:h-12 md:w-12 text-white animate-pulse" />
          </div>

          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-black gradient-text neon-glow leading-none mb-4">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="space-y-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Oops! Page Not Found
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
              The page you're looking for seems to have wandered off. Let's get you back on track!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button size="lg" className="btn-hover gradient-primary text-white border-0 gap-2 shadow-2xl shadow-purple-500/40 w-full sm:w-auto">
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="btn-hover gap-2 glass-card border-purple-300/50 dark:border-purple-600/50 w-full sm:w-auto">
                <Search className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Decorative Element */}
          <div className="mt-12 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Link */}
        <Link href="/">
          <Button variant="ghost" className="mt-8 gap-2 btn-hover text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
