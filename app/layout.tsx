import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterviewAI - AI-Powered Mock Interview Platform",
    template: "%s | InterviewAI",
  },
  description:
    "Prepare for your dream job with AI-powered mock interviews, real-time feedback, emotion analysis, and comprehensive performance reports.",
  keywords: [
    "mock interview",
    "AI interview",
    "interview preparation",
    "technical interview",
    "job interview practice",
    "coding interview",
    "FAANG interview",
  ],
  authors: [{ name: "InterviewAI" }],
  creator: "InterviewAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "InterviewAI - AI-Powered Mock Interview Platform",
    description: "Prepare for your dream job with AI-powered mock interviews",
    siteName: "InterviewAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI",
    description: "AI-Powered Mock Interview Platform",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
        <body className="font-sans antialiased bg-mesh-gradient">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster 
              richColors 
              position="top-right" 
              toastOptions={{
                className: "glass-card",
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
