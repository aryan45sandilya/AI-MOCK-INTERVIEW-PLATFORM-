"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Briefcase, Layers, Tags, Wand2,
  FileText, ChevronRight, ChevronLeft, Loader2, Plus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CreateInterviewSchema, type CreateInterviewInput } from "@/types";

// ── Field presets by domain ───────────────────────────────────────────────────
const FIELD_PRESETS: Record<string, { label: string; icon: string; roles: string[]; skills: string[] }> = {
  technology: {
    label: "Technology & Engineering",
    icon: "💻",
    roles: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Engineer", "DevOps Engineer", "Data Scientist", "ML Engineer", "Mobile Developer", "Cybersecurity Analyst"],
    skills: ["JavaScript", "TypeScript", "Python", "Java", "React", "Node.js", "AWS", "Docker", "System Design", "Data Structures", "Algorithms", "SQL", "REST APIs"],
  },
  business: {
    label: "Business & MBA",
    icon: "📊",
    roles: ["Business Analyst", "Product Manager", "Strategy Consultant", "Operations Manager", "Marketing Manager", "Finance Analyst", "Investment Banker", "Management Consultant"],
    skills: ["Financial Modeling", "Case Studies", "Strategy", "Market Analysis", "Leadership", "Operations", "Stakeholder Management", "Consulting Frameworks", "Excel", "Presentation"],
  },
  medical: {
    label: "Medical & Healthcare",
    icon: "🏥",
    roles: ["MBBS Doctor", "Medical Officer", "Resident Doctor", "Pharmacist", "Nurse", "Dentist", "Surgeon", "Psychiatrist", "Radiologist", "Anesthesiologist"],
    skills: ["Clinical Knowledge", "Patient Management", "Diagnosis", "Pharmacology", "Medical Ethics", "Emergency Care", "Communication", "Evidence-Based Medicine", "Anatomy", "Physiology"],
  },
  law: {
    label: "Law & Legal",
    icon: "⚖️",
    roles: ["Advocate", "Corporate Lawyer", "Criminal Lawyer", "Legal Associate", "Judicial Clerk", "Public Prosecutor", "Legal Advisor", "IP Lawyer", "Civil Lawyer"],
    skills: ["Constitutional Law", "Contract Law", "Criminal Procedure", "Legal Drafting", "Case Analysis", "Court Procedures", "Legal Research", "Corporate Law", "Litigation", "Negotiation"],
  },
  finance: {
    label: "Finance & Banking",
    icon: "💰",
    roles: ["CA / Chartered Accountant", "Financial Analyst", "Investment Banker", "Credit Analyst", "Risk Manager", "Portfolio Manager", "Actuary", "Tax Consultant", "Auditor"],
    skills: ["Financial Analysis", "Accounting", "Taxation", "Auditing", "Valuation", "Risk Assessment", "Banking Regulations", "Excel & Modeling", "IFRS/GAAP", "Financial Planning"],
  },
  design: {
    label: "Design & Creative",
    icon: "🎨",
    roles: ["UI/UX Designer", "Product Designer", "Graphic Designer", "Motion Designer", "Brand Designer", "Web Designer", "Game Designer", "Interior Designer"],
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Adobe Suite", "Typography", "Color Theory", "Accessibility", "Visual Design"],
  },
  education: {
    label: "Education & Teaching",
    icon: "📚",
    roles: ["Teacher", "Professor", "Academic Researcher", "Education Counselor", "Principal", "Curriculum Designer", "Tutor", "Training Manager"],
    skills: ["Pedagogy", "Curriculum Design", "Classroom Management", "Assessment", "Student Engagement", "Communication", "Research Methods", "Educational Psychology"],
  },
  government: {
    label: "Government & Civil Services",
    icon: "🏛️",
    roles: ["IAS Officer", "IPS Officer", "IRS Officer", "Civil Servant", "Policy Analyst", "Government Administrator", "Public Relations Officer"],
    skills: ["Public Policy", "Governance", "Current Affairs", "Essay Writing", "Leadership", "Ethics", "Constitution", "Economics", "History", "Political Science"],
  },
  hr: {
    label: "HR & People",
    icon: "👥",
    roles: ["HR Manager", "Recruiter", "Talent Acquisition", "HRBP", "Learning & Development", "Compensation & Benefits", "HR Generalist"],
    skills: ["Recruitment", "Employee Relations", "Performance Management", "HRIS", "Labor Law", "Payroll", "Training & Development", "Culture Building", "Conflict Resolution"],
  },
  sales: {
    label: "Sales & Marketing",
    icon: "📈",
    roles: ["Sales Manager", "Account Executive", "Business Development", "Digital Marketer", "Brand Manager", "Growth Hacker", "Content Strategist", "SEO Specialist"],
    skills: ["Sales Strategy", "CRM", "Negotiation", "Lead Generation", "Digital Marketing", "SEO/SEM", "Social Media", "Analytics", "Content Marketing", "Customer Success"],
  },
};

const EXPERIENCE_OPTIONS = ["Beginner (No Experience)", "0-1 years", "1-2 years", "2-5 years", "5-8 years", "8+ years"];

const INTERVIEW_TYPES = [
  { value: "technical", label: "Technical / Subject", icon: "📖", desc: "Domain knowledge and subject expertise" },
  { value: "hr", label: "HR Round", icon: "🤝", desc: "Culture fit, motivation, soft skills" },
  { value: "behavioral", label: "Behavioral", icon: "🧠", desc: "Past experiences using STAR method" },
  { value: "system_design", label: "Case Study / Design", icon: "🏗️", desc: "Problem solving and case analysis" },
  { value: "coding", label: "Practical / Coding", icon: "⌨️", desc: "Hands-on practical skills assessment" },
  { value: "mixed", label: "Mixed / Comprehensive", icon: "🎯", desc: "All-round interview covering every area" },
];

interface ResumeOption {
  id: string;
  fileName: string;
  isDefault: boolean | null;
  createdAt: Date;
}

export function CreateInterviewForm({ resumes }: { resumes: ResumeOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("");
  const [customSkill, setCustomSkill] = useState("");

  const form = useForm<CreateInterviewInput>({
    resolver: zodResolver(CreateInterviewSchema),
    defaultValues: {
      title: "",
      role: "",
      experience: "Beginner (No Experience)",
      difficulty: "medium",
      interviewType: "mixed",
      techStack: [],
      numberOfQuestions: 10,
    },
  });

  const { watch, setValue, handleSubmit, trigger, register, formState: { errors } } = form;
  const watchedValues = watch();

  const goNext = async () => {
    let valid = true;
    if (step === 1) valid = await trigger(["role"]);
    if (valid) setStep((s) => s + 1);
  };

  const toggleSkill = (skill: string) => {
    const current = watchedValues.techStack || [];
    if (current.includes(skill)) {
      setValue("techStack", current.filter((t) => t !== skill));
    } else {
      setValue("techStack", [...current, skill]);
    }
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (!skill) return;
    const current = watchedValues.techStack || [];
    if (!current.includes(skill)) {
      setValue("techStack", [...current, skill]);
    }
    setCustomSkill("");
  };

  const selectFieldPreset = (fieldKey: string) => {
    setSelectedField(fieldKey);
    // Clear current skills when switching field
    setValue("techStack", []);
  };

  const selectRole = (role: string) => {
    setValue("role", role, { shouldValidate: true });
    const title = `${role} Interview`;
    setValue("title", title);
  };

  const onSubmit = async (data: CreateInterviewInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create interview");
      }
      const { data: interview } = await res.json();
      toast.success("Interview created! Generating questions...");
      router.push(`/interviews/${interview.id}/room`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create interview");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Field & Role" },
    { number: 2, label: "Interview Type" },
    { number: 3, label: "Skills / Topics" },
    { number: 4, label: "Review" },
  ];

  const currentPreset = selectedField ? FIELD_PRESETS[selectedField] : null;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1 sm:gap-2">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-1 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => step > s.number && setStep(s.number)}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all",
                step === s.number ? "bg-primary text-primary-foreground" :
                  step > s.number ? "bg-green-500 text-white cursor-pointer" :
                    "bg-muted text-muted-foreground"
              )}
            >
              {step > s.number ? "✓" : s.number}
            </button>
            <span className={cn("text-xs sm:text-sm hidden sm:inline truncate", step === s.number ? "font-semibold" : "text-muted-foreground")}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn("h-px w-4 sm:w-6 shrink-0", step > s.number ? "bg-green-500" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Step 1: Field & Role ─────────────────────────────────────────────── */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Field & Role
              </CardTitle>
              <CardDescription>Select your field and the role you're preparing for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Field selector */}
              <div className="space-y-2">
                <Label>Select Your Field</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(FIELD_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectFieldPreset(key)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                        selectedField === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="text-lg shrink-0">{preset.icon}</span>
                      <span className="text-xs leading-tight">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role — quick-pick from preset OR free-type */}
              <div className="space-y-2">
                <Label htmlFor="role">Target Role <span className="text-red-500">*</span></Label>
                {currentPreset && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {currentPreset.roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => selectRole(r)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs transition-all",
                          watchedValues.role === r
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                <Input
                  id="role"
                  placeholder={currentPreset ? "Or type a custom role..." : "e.g. Doctor, Lawyer, MBA, Software Engineer, Teacher..."}
                  {...register("role")}
                />
                {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Interview Title <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. MBBS Residency Interview, CA Final Interview..."
                  {...register("title")}
                />
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setValue("experience", exp as CreateInterviewInput["experience"], { shouldValidate: true })}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all text-left",
                        watchedValues.experience === exp
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValue("difficulty", d)}
                      className={cn(
                        "rounded-lg border-2 py-2.5 text-sm font-semibold capitalize transition-all",
                        watchedValues.difficulty === d
                          ? d === "easy" ? "border-green-500 bg-green-500/10 text-green-600"
                            : d === "medium" ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                              : "border-red-500 bg-red-500/10 text-red-600"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {d === "easy" ? "🟢" : d === "medium" ? "🟡" : "🔴"} {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume */}
              {resumes.length > 0 && (
                <div className="space-y-2">
                  <Label>Use Resume / CV (optional)</Label>
                  <Select onValueChange={(v) => setValue("resumeId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select for personalised questions" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <FileText className="h-4 w-4 inline mr-2" />
                          {r.fileName} {r.isDefault && "(Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Questions slider */}
              <div className="space-y-2">
                <Label>Number of Questions: <span className="font-bold text-primary">{watchedValues.numberOfQuestions}</span></Label>
                <input
                  type="range" min={5} max={20} step={1}
                  value={watchedValues.numberOfQuestions}
                  onChange={(e) => setValue("numberOfQuestions", parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 (Quick)</span><span>20 (Thorough)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Interview Type ───────────────────────────────────────────── */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Interview Type
              </CardTitle>
              <CardDescription>Choose the format that matches your actual interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue("interviewType", type.value as CreateInterviewInput["interviewType"])}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                      watchedValues.interviewType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Skills / Topics ──────────────────────────────────────────── */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-primary" /> Key Skills & Topics
              </CardTitle>
              <CardDescription>
                Select topics the AI should focus on — or add your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset skills for selected field */}
              {currentPreset && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{currentPreset.icon} Suggested for {currentPreset.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentPreset.skills.map((skill) => {
                      const selected = watchedValues.techStack?.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-sm transition-all",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom skill input */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Add Custom Topic / Skill</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Criminal Procedure, Cardiology, Derivatives..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected skills */}
              {(watchedValues.techStack?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Selected ({watchedValues.techStack?.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {watchedValues.techStack?.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {errors.techStack && (
                <p className="text-xs text-destructive">{errors.techStack.message}</p>
              )}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                💡 Tip: Adding relevant topics helps AI generate more targeted questions. Leave empty for general questions about your role.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Step 4: Review ───────────────────────────────────────────────────── */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" /> Review & Create
              </CardTitle>
              <CardDescription>Confirm your interview configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                {[
                  { label: "Field", value: currentPreset ? `${currentPreset.icon} ${currentPreset.label}` : "Custom" },
                  { label: "Role", value: watchedValues.role },
                  { label: "Experience", value: watchedValues.experience },
                  { label: "Difficulty", value: watchedValues.difficulty },
                  { label: "Type", value: watchedValues.interviewType?.replace("_", " ") },
                  { label: "Questions", value: `${watchedValues.numberOfQuestions} questions` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium capitalize">{item.value}</span>
                  </div>
                ))}
                {(watchedValues.techStack?.length ?? 0) > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Topics / Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.techStack?.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                AI will generate <span className="font-semibold text-foreground">{watchedValues.numberOfQuestions}</span> personalised questions for <span className="font-semibold text-foreground">{watchedValues.role}</span>.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            type="button" variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={goNext} className="gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" variant="gradient" disabled={loading} className="gap-2">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating questions...</>
                : <><Wand2 className="h-4 w-4" /> Create Interview</>
              }
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
