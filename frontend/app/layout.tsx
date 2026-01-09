import type { Metadata } from "next";
// 1. Import font JetBrains Mono
import { JetBrains_Mono } from "next/font/google"; 
import "./globals.css";

// 2. Konfigurasi font
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"], // Kita ambil yang biasa dan bold
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
    <html lang="en">
      {/* 3. Terapkan font ke body */}
      <body className={`${jetbrainsMono.variable} font-mono antialiased bg-black text-green-400`}>
        {children}
      </body>
    </html>
  );
}