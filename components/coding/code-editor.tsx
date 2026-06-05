"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Play, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

interface CodeEditorProps {
  language?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  interviewId?: string;
  questionId?: string;
  height?: string;
}

interface ExecutionResult {
  output?: string;
  error?: string;
  time?: number;
}

export function CodeEditor({
  language = "javascript",
  defaultValue = "// Write your solution here\n",
  onChange,
  interviewId,
  questionId,
  height = "300px",
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(defaultValue);
  const [selectedLang, setSelectedLang] = useState(language);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const handleChange = useCallback(
    (val: string | undefined) => {
      setCode(val || "");
      onChange?.(val);
    },
    [onChange]
  );

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: selectedLang, interviewId, questionId }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Execution failed. Please try again." });
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setCode(defaultValue);
    onChange?.(defaultValue);
    setResult(null);
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50 gap-2">
        <Select value={selectedLang} onValueChange={setSelectedLang}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value} className="text-xs">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleRun}
            disabled={running}
          >
            <Play className="h-3 w-3" />
            {running ? "Running..." : "Run Code"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <Editor
        height={height}
        language={selectedLang === "cpp" ? "cpp" : selectedLang}
        value={code}
        onChange={handleChange}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          wordWrap: "on",
          tabSize: 2,
          formatOnPaste: true,
          automaticLayout: true,
        }}
      />

      {/* Output */}
      {result && (
        <div className="border-t bg-slate-950 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={result.error ? "destructive" : "default"} className="text-xs">
              {result.error ? "Error" : "Output"}
            </Badge>
            {result.time && (
              <span className="text-xs text-muted-foreground">{result.time}ms</span>
            )}
          </div>
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {result.error || result.output || "No output"}
          </pre>
        </div>
      )}
    </div>
  );
}
