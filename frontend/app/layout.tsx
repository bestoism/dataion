import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google"; // Tambah Inter
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 

// Font untuk teks umum (modern & clean)
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Font untuk data, kode, dan elemen teknis (engineering feel)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "DATAION | End-to-End Data Contract & AutoML Platform",
  description: "Secure data platform enforcing data contracts and schema validation to ensure reliable machine learning pipelines. Built with Next.js, FastAPI, and XGBoost.",
  keywords: [
    "DATAION", "Data Contract", "AutoML", "Data Engineering", 
    "Schema Validation", "MLOps", "Next.js Project", "FastAPI"
  ],
  authors: [{ name: "Bestoism" }],
  openGraph: {
    title: "DATAION - Modern MLOps Platform",
    description: "Validate data schemas and train models automatically with DATAION.",
    url: "https://dataion.vercel.app",
    siteName: "DATAION",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DATAION Preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DATAION | End-to-End MLOps",
    description: "Strict data contracts for reliable ML pipelines.",
  },
  verification: {
    google: "K_wbPYG_zupJ4bk2KKmxNAcRa6LaWZO_T-uI6tQdPDc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable} 
          ${jetbrainsMono.variable} 
          antialiased 
          min-h-screen
          bg-zinc-50 text-zinc-950
          dark:bg-[#09090b] dark:text-zinc-50
          selection:bg-indigo-500/30
          transition-colors duration-300
        `}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Main Wrapper untuk memberikan efek grain/noise halus di seluruh app (opsional via CSS) */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}