import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import ReactDOM from "react-dom";

ReactDOM.preconnect("https://fonts.googleapis.com");
ReactDOM.preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoodSpace | Seu espaço, seu mood",
  description: "Crie e compartilhe seu mural pessoal estético e imersivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-center" richColors theme="system" />
      </body>
    </html>
  );
}
