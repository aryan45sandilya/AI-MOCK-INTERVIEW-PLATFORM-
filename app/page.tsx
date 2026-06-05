import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { 
  Brain, Mic, Video, BarChart3, Code2, FileText, Star, ArrowRight, 
  CheckCircle2, Zap, Shield, Globe, Sparkles, Target, TrendingUp,
  Users, Award, Rocket, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    { 
      icon: Brain, 
      title: "AI-Generated Questions", 
      desc: "Tailored questions based on your role, experience, and tech stack using GPT-4o & Gemini.",
      gradient: "from-purple-500 to-indigo-500"
    },
    { 
      icon: Mic, 
      title: "Speech-to-Text", 
      desc: "Answer questions naturally with your voice. Powered by OpenAI Whisper for accurate transcription.",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: Video, 
      title: "Emotion Analysis", 
      desc: "Real-time webcam analysis tracks confidence, eye contact, and attention using MediaPipe.",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      icon: Code2, 
      title: "Live Coding Round", 
      desc: "Integrated Monaco editor with multi-language support and real-time code execution.",
      gradient: "from-orange-500 to-red-500"
    },
    { 
      icon: FileText, 
      title: "Resume-Based Questions", 
      desc: "Upload your PDF resume and get interview questions tailored to your specific experience.",
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      icon: BarChart3, 
      title: "Detailed Reports", 
      desc: "Comprehensive feedback with scores, strengths, weaknesses, and improvement roadmap.",
      gradient: "from-violet-500 to-purple-500"
    },
  ];

  const stats = [
    { value: "10K+", label: "Interviews Completed", icon: Users },
    { value: "95%", label: "User Satisfaction", icon: Award },
    { value: "3x", label: "Faster Preparation", icon: Rocket },
    { value: "500+", label: "Companies Covered", icon: Target },
  ];

  const testimonials = [
    { 
      name: "Sarah Chen", 
      role: "Software Engineer @ Google", 
      text: "InterviewAI helped me ace my FAANG interview. The emotion analysis was eye-opening!", 
      rating: 5,
      avatar: "SC"
    },
    { 
      name: "Marcus Johnson", 
      role: "Full-Stack Dev @ Stripe", 
      text: "The AI-generated questions were surprisingly relevant. Got my offer after 2 weeks of practice.", 
      rating: 5,
      avatar: "MJ"
    },
    { 
      name: "Priya Patel", 
      role: "Data Scientist @ Meta", 
      text: "Best interview prep tool I've used. The detailed reports helped me identify my weak spots.", 
      rating: 5,
      avatar: "PP"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/20 dark:via-purple-950/10 to-background overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Nav */}
      <header className="fixed top-0 w-full z-50 glass-morphism">
        <div className="container flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl md:text-2xl">
            <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-purple-500/30">
              <Brain className="h-6 w-6 md:h-7 md:w-7 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-2xl gradient-primary opacity-50 blur-xl" />
            </div>
            <span className="gradient-text neon-glow hidden sm:inline">InterviewAI</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="btn-hover">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="btn-hover gradient-primary text-white border-0 gap-2 shadow-lg shadow-purple-500/30">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Start Free</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4">
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-6 px-5 py-2 text-sm md:text-base glass-card border-purple-300/50 dark:border-purple-600/50 shadow-lg">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              Powered by GPT-4o & Gemini 2.5
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-6 md:mb-8 leading-tight animate-slide-up">
            Ace Every Interview with{" "}
            <span className="gradient-text neon-glow animate-gradient inline-block">
              AI-Powered
            </span>{" "}
            <br className="hidden md:inline" />
            Practice
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 md:mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Practice with realistic AI mock interviews, get instant feedback, emotion analysis, and personalized improvement plans. 
            <span className="gradient-text-alt font-semibold"> Land your dream job faster.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/sign-up">
              <Button size="lg" className="btn-hover gradient-primary text-white border-0 gap-2 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg shadow-2xl shadow-purple-500/40 relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Interview 
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="btn-hover gap-2 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg glass-card border-purple-300/50 dark:border-purple-600/50 hover:border-purple-400 dark:hover:border-purple-500">
                <Video className="h-5 w-5" />
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            No credit card required • Free to start • <Clock className="inline h-4 w-4" /> 2 min setup
          </p>
        </div>

        {/* Floating decoration */}
        <div className="absolute top-1/4 left-10 hidden lg:block animate-float">
          <div className="glass-card p-4 rounded-2xl shadow-xl">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="absolute top-1/3 right-10 hidden lg:block animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass-card p-4 rounded-2xl shadow-xl">
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16 border-y backdrop-blur-sm relative z-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-2xl gradient-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-black gradient-text mb-2">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 lg:py-32 px-4 relative z-10">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20 animate-fade-in">
            <Badge variant="secondary" className="mb-4 glass-card px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 gradient-text">Everything you need to prepare</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A complete interview preparation platform with cutting-edge AI technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="card-hover glass-card border-2 group animate-slide-up overflow-hidden relative"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardContent className="pt-6 md:pt-8 relative">
                    <div className={`flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} mb-5 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg md:text-xl mb-3 group-hover:gradient-text transition-all duration-300">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 px-4 glass-morphism relative z-10">
        <div className="container max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 md:mb-6 glass-card px-4 py-2 animate-fade-in">
            <Target className="h-3.5 w-3.5 mr-1 text-purple-500" />
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-12 md:mb-20 gradient-text animate-slide-up">
            Get interview-ready in 3 steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { 
                step: "01", 
                title: "Create Interview", 
                desc: "Choose your role, experience level, tech stack, and upload your resume.",
                icon: FileText,
                color: "from-purple-500 to-indigo-500"
              },
              { 
                step: "02", 
                title: "Practice with AI", 
                desc: "Answer questions via voice or text. Get real-time emotion analysis.",
                icon: Brain,
                color: "from-blue-500 to-cyan-500"
              },
              { 
                step: "03", 
                title: "Review & Improve", 
                desc: "Get detailed scores, AI feedback, and a personalized improvement plan.",
                icon: TrendingUp,
                color: "from-green-500 to-emerald-500"
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className={`absolute -inset-4 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-3xl`} />
                  <div className="relative glass-card p-6 md:p-8 rounded-3xl">
                    <div className={`flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} mb-5 md:mb-6 mx-auto shadow-xl`}>
                      <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-purple-500/10 mb-3 md:mb-4">{item.step}</div>
                    <h3 className="font-bold text-xl md:text-2xl mb-3 md:mb-4">{item.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-4 glass-card px-4 py-2">
              <Award className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black gradient-text">Loved by job seekers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <Card key={t.name} className="card-hover glass-card group overflow-hidden relative animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-6 md:pt-8 relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full gradient-primary text-white font-bold text-base md:text-lg shadow-lg">
                      {t.avatar}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-sm md:text-base">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed italic">"{t.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-block p-3 md:p-4 rounded-full gradient-secondary shadow-2xl mb-6 md:mb-8 animate-pulse">
              <Rocket className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-white">
              Ready to land your dream job?
            </h2>
            <p className="text-blue-100 text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of engineers who've already leveled up their interview skills with AI-powered practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Link href="/sign-up">
                <Button size="lg" className="btn-hover bg-white text-purple-700 hover:bg-blue-50 gap-2 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg shadow-2xl font-bold group">
                  Start for Free 
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8 md:mt-10 text-blue-100 text-xs md:text-sm">
              {[
                { icon: CheckCircle2, text: "No credit card" },
                { icon: CheckCircle2, text: "Cancel anytime" },
                { icon: Shield, text: "GDPR compliant" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.text} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 md:h-5 md:w-5" /> {item.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t glass-morphism relative z-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <Brain className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="font-black text-lg md:text-xl gradient-text">InterviewAI</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            © 2025 InterviewAI. All rights reserved. Made with ❤️ for job seekers
          </p>
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> SOC2 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> GDPR Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
