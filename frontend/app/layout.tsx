import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // <--- Import ini

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "DATAION Platform",
  description: "End-to-End Data Contract Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* PERHATIKAN BAGIAN CLASSNAME INI */}
      <body className={`${jetbrainsMono.variable} font-mono antialiased 
        min-h-screen
        bg-white text-zinc-900 
        dark:bg-[#09090b] dark:text-zinc-100 
        transition-colors duration-300`} // Efek transisi halus
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}