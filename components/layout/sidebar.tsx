"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlusCircle, FileText, BarChart3,
  Settings, Upload, Code2, Brain, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interviews/new", label: "New Interview", icon: PlusCircle, badge: "New" },
  { href: "/interviews", label: "My Interviews", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const toolsNav = [
  { href: "/resume", label: "Resume Manager", icon: Upload },
  { href: "/coding", label: "Coding Practice", icon: Code2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r bg-card/50 p-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-base gradient-text">InterviewAI</p>
          <p className="text-xs text-muted-foreground">AI Mock Platform</p>
        </div>
      </div>

      <Separator />

      {/* Main Nav */}
      <nav className="flex flex-col gap-1 mt-2">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Main</p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-between group",
                  isActive && "font-semibold bg-primary/10 text-primary hover:bg-primary/15"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                </span>
                <span className="flex items-center gap-1">
                  {item.badge && <Badge variant="info" className="text-xs py-0 px-1">{item.badge}</Badge>}
                  {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-2" />

      {/* Tools Nav */}
      <nav className="flex flex-col gap-1">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tools</p>
        {toolsNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn("w-full justify-start gap-2", isActive && "font-semibold")}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Separator className="mb-3" />
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Settings
          </Button>
        </Link>
      </div>
    </aside>
  );
}
