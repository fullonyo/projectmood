import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/context";
import { ScaleProvider } from "@/lib/contexts/ScaleProvider";

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
//teste
export const metadata: Metadata = {
  title: {
    default: "MoodSpace | Seu espaço, seu mood",
    template: "%s | MoodSpace"
  },
  description: "Crie e compartilhe seu mural pessoal estético e imersivo. Aesthetic moods, music & GIFs.",
  keywords: ["moodboard", "aesthetic", "creative space", "personal profile", "moodspace"],
  authors: [{ name: "MoodSpace Team" }],
  creator: "MoodSpace",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://moodproject.vercel.app",
    siteName: "MoodSpace",
    title: "MoodSpace | Seu espaço, seu mood",
    description: "Crie e compartilhe seu mural pessoal estético e imersivo.",
    images: [
      {
        url: "/og-base.png",
        width: 1200,
        height: 630,
        alt: "MoodSpace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodSpace | Seu espaço, seu mood",
    description: "Crie e compartilhe seu mural pessoal estético e imersivo.",
    images: ["/og-base.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
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
        <I18nProvider>
          <ScaleProvider>
            {children}
          </ScaleProvider>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(9, 9, 11, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '0px',
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              },
              className: "font-mono",
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
