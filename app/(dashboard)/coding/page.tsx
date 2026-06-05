import { Metadata } from "next";
import { CodingPractice } from "@/components/coding/coding-practice";

export const metadata: Metadata = { title: "Coding Practice" };

export default function CodingPage() {
  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Coding Practice</h1>
        <p className="text-muted-foreground mt-1">
          Sharpen your algorithmic thinking with AI-powered coding challenges
        </p>
      </div>
      <CodingPractice />
    </div>
  );
}
