import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { CodeExecutionSchema } from "@/types";
import { ZodError } from "zod";

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
  rust: 73,
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = CodeExecutionSchema.parse(body);
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    // Judge0 via RapidAPI when key present
    if (rapidApiKey) {
      const langId = LANGUAGE_IDS[data.language] ?? 63;
      const res = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": rapidApiKey,
          },
          body: JSON.stringify({ source_code: data.code, language_id: langId, stdin: "" }),
        }
      );
      const result = await res.json();
      if (result.status?.id === 3) {
        return NextResponse.json({ output: result.stdout || "(no output)", time: result.time });
      }
      return NextResponse.json({ error: result.stderr || result.compile_output || "Execution failed" });
    }

    // Sandboxed JS fallback
    if (data.language === "javascript") {
      const forbidden = ["require(", "import(", "process.env", "child_process", "__dirname", "eval("];
      if (forbidden.some((f) => data.code.includes(f))) {
        return NextResponse.json({ error: "Code contains restricted operations" });
      }
      try {
        const logs: string[] = [];
        const fn = new Function(
          "console",
          `"use strict";\ntry{\n${data.code}\n}catch(e){console.error(e.message);}`
        );
        fn({
          log: (...a: unknown[]) => logs.push(a.map(String).join(" ")),
          error: (...a: unknown[]) => logs.push("[error] " + a.join(" ")),
          warn: (...a: unknown[]) => logs.push("[warn] " + a.join(" ")),
        });
        return NextResponse.json({ output: logs.join("\n") || "(no output)" });
      } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Runtime error" });
      }
    }

    return NextResponse.json({
      output: `[Demo] ${data.language} code received.\nAdd RAPIDAPI_KEY to .env.local for live execution.`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[POST /api/code/execute]", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
