"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm font-medium mr-2">Theme</p>
      {[
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
      ].map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.value}
            variant={theme === t.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTheme(t.value)}
            className={cn("gap-2", theme === t.value && "font-semibold")}
          >
            <Icon className="h-4 w-4" />
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
