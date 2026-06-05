import pdfParse from "pdf-parse";

export interface ParsedResume {
  text: string;
  info: {
    title?: string;
    author?: string;
    pages?: number;
  };
  skills: string[];
  experience: string[];
  education: string[];
}

export async function parseResumeFile(buffer: Buffer): Promise<ParsedResume> {
  const data = await pdfParse(buffer);

  const text = data.text;
  const info = data.info;

  // Extract sections
  const skills = extractSkills(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);

  return {
    text,
    info: {
      title: info?.Title,
      author: info?.Author,
      pages: data.numpages,
    },
    skills,
    experience,
    education,
  };
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    // Languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
    // Frameworks
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Django",
    "FastAPI",
    "Spring",
    "Laravel",
    // Databases
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Elasticsearch",
    // Cloud
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    // Other
    "GraphQL",
    "REST",
    "Git",
    "CI/CD",
    "Agile",
    "Scrum",
  ];

  const foundSkills: string[] = [];
  const textUpper = text.toLowerCase();

  for (const skill of skillKeywords) {
    if (textUpper.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
}

function extractExperience(text: string): string[] {
  const lines = text.split("\n");
  const experienceLines: string[] = [];
  let inExperience = false;

  for (const line of lines) {
    const lineUpper = line.toUpperCase();
    if (
      lineUpper.includes("EXPERIENCE") ||
      lineUpper.includes("WORK HISTORY") ||
      lineUpper.includes("EMPLOYMENT")
    ) {
      inExperience = true;
      continue;
    }

    if (
      inExperience &&
      (lineUpper.includes("EDUCATION") ||
        lineUpper.includes("SKILLS") ||
        lineUpper.includes("CERTIFICATIONS"))
    ) {
      break;
    }

    if (inExperience && line.trim().length > 0) {
      experienceLines.push(line.trim());
    }
  }

  return experienceLines.slice(0, 10);
}

function extractEducation(text: string): string[] {
  const lines = text.split("\n");
  const educationLines: string[] = [];
  let inEducation = false;

  for (const line of lines) {
    const lineUpper = line.toUpperCase();
    if (
      lineUpper.includes("EDUCATION") ||
      lineUpper.includes("ACADEMIC") ||
      lineUpper.includes("QUALIFICATION")
    ) {
      inEducation = true;
      continue;
    }

    if (
      inEducation &&
      (lineUpper.includes("EXPERIENCE") ||
        lineUpper.includes("SKILLS") ||
        lineUpper.includes("PROJECTS"))
    ) {
      break;
    }

    if (inEducation && line.trim().length > 0) {
      educationLines.push(line.trim());
    }
  }

  return educationLines.slice(0, 5);
}
