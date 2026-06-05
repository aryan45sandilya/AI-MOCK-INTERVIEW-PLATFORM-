"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, Star, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn, formatDate, formatFileSize } from "@/lib/utils";

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  isDefault?: boolean | null;
  createdAt: Date;
}

interface ResumeManagerProps {
  initialResumes: Resume[];
}

export function ResumeManager({ initialResumes }: ResumeManagerProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [setDefault, setSetDefault] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("setDefault", String(setDefault));

      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { data } = await res.json();
      setResumes((prev) => [data, ...prev.filter((r) => !setDefault || !r.isDefault)]);
      toast.success("Resume uploaded successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [setDefault, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <Upload className={cn("h-12 w-12", isDragActive ? "text-primary" : "text-muted-foreground")} />
          )}
          <div>
            <p className="font-semibold">
              {uploading ? "Uploading & parsing..." : isDragActive ? "Drop your PDF here" : "Upload your resume"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to select a PDF file (max 10MB)
            </p>
          </div>
          {!uploading && (
            <Button variant="outline" size="sm" type="button">
              Select File
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={setDefault} onCheckedChange={setSetDefault} id="set-default" />
        <label htmlFor="set-default" className="text-sm cursor-pointer">
          Set as default resume for new interviews
        </label>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No resumes uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold">Your Resumes ({resumes.length})</h2>
          {resumes.map((resume) => (
            <Card key={resume.id} className={cn(resume.isDefault && "border-primary/50 bg-primary/5")}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 shrink-0">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{resume.fileName}</p>
                      {resume.isDefault && (
                        <Badge variant="default" className="text-xs shrink-0">
                          <Star className="h-3 w-3 mr-1" /> Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {resume.fileSize ? formatFileSize(resume.fileSize) : ""} • {formatDate(resume.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs">
                      View
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(resume.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">How resume-based interviews work</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• AI extracts your skills, experience, and projects from your PDF</li>
                <li>• Questions are tailored to probe deeper into your specific background</li>
                <li>• Interviewers can spot inconsistencies between claims and knowledge</li>
                <li>• Works best with ATS-friendly, well-structured PDF resumes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
