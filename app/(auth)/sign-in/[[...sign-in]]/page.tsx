import { SignIn } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">InterviewAI</span>
          </Link>
          <p className="text-slate-400 text-sm">Welcome back! Sign in to continue</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-2xl border border-white/10 bg-slate-800/80 backdrop-blur",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              formButtonPrimary:
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              formFieldInput:
                "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500",
              formFieldLabel: "text-slate-300",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      </div>
    </div>
  );
}
