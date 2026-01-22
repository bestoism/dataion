import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// === BAGIAN INI YANG DI-UPDATE UNTUK SEO ===
export const metadata: Metadata = {
  title: "DATAION | End-to-End Data Contract & AutoML Platform",
  description: "Secure data platform enforcing data contracts and schema validation to ensure reliable machine learning pipelines. Built with Next.js, FastAPI, and XGBoost.",
  
  // Kata kunci agar orang bisa menemukan web ini
  keywords: [
    "DATAION", 
    "Data Contract", 
    "AutoML", 
    "Machine Learning Platform", 
    "Data Engineering", 
    "Schema Validation", 
    "MLOps",
    "Next.js Project",
    "FastAPI"
  ],
  
  // Penulis
  authors: [{ name: "Bestoism" }], // Ganti dengan nama asli Anda jika mau
  
  // Pengaturan Open Graph (Tampilan saat link di-share di LinkedIn/WA/Twitter)
  openGraph: {
    title: "DATAION - Modern MLOps Platform",
    description: "Validate data schemas and train models automatically with DATAION.",
    url: "https://dataion.vercel.app", // Pastikan ini URL Vercel Anda
    siteName: "DATAION",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png", // (Opsional) Jika Anda menaruh gambar di folder public
        width: 1200,
        height: 630,
        alt: "DATAION Dashboard Preview",
      },
    ],
  },

  // Pengaturan Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "DATAION | End-to-End MLOps",
    description: "Strict data contracts for reliable ML pipelines.",
  },

  // Verifikasi Google Search Console (Nanti diisi kode dari Google)
  verification: {
    google: "K_wbPYG_zupJ4bk2KKmxNAcRa6LaWZO_T-uI6tQdPDc", // Hapus baris ini jika belum ada kodenya
  },
};
// ==========================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} font-mono antialiased 
        min-h-screen
        bg-white text-zinc-900 
        dark:bg-[#09090b] dark:text-zinc-100 
        transition-colors duration-300`} 
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}