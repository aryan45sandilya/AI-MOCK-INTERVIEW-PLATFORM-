import { Router, Request, Response } from "express";

export const codeRouter = Router();

codeRouter.post("/execute", async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ error: "Missing code or language" });

    const rapidApiKey = process.env.RAPIDAPI_KEY;

    const LANGUAGE_IDS: Record<string, number> = {
      javascript: 63, typescript: 74, python: 71,
      java: 62, cpp: 54, go: 60, rust: 73,
    };

    if (rapidApiKey) {
      const langId = LANGUAGE_IDS[language] || 63;
      const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": rapidApiKey,
        },
        body: JSON.stringify({ source_code: code, language_id: langId, stdin: "" }),
      });
      const result = await response.json();

      if (result.status?.id === 3) {
        return res.json({ output: result.stdout || "No output", time: result.time });
      } else {
        return res.json({ error: result.stderr || result.compile_output || "Execution failed" });
      }
    }

    res.json({ output: `[Demo mode] Code received for ${language}. Add RAPIDAPI_KEY for live execution.`, time: "—" });
  } catch (error) {
    console.error("[POST /code/execute]", error);
    res.status(500).json({ error: "Execution failed" });
  }
});
