"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const statuses = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const types = [
  { value: "", label: "All Types" },
  { value: "technical", label: "Technical" },
  { value: "hr", label: "HR" },
  { value: "behavioral", label: "Behavioral" },
  { value: "coding", label: "Coding" },
  { value: "mixed", label: "Mixed" },
];

export function InterviewFilters({
  activeStatus,
  activeType,
}: {
  activeStatus?: string;
  activeType?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key === "status" && value) params.set("status", value);
    if (key === "type" && value) params.set("type", value);
    if (key === "status" && activeType) params.set("type", activeType);
    if (key === "type" && activeStatus) params.set("status", activeStatus);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-sm text-muted-foreground mr-1">Status:</span>
        {statuses.map((s) => (
          <Button
            key={s.value}
            variant={activeStatus === s.value || (!activeStatus && s.value === "") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateFilter("status", s.value)}
            className="h-7 text-xs"
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-sm text-muted-foreground mr-1">Type:</span>
        {types.map((t) => (
          <Button
            key={t.value}
            variant={activeType === t.value || (!activeType && t.value === "") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateFilter("type", t.value)}
            className="h-7 text-xs"
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
