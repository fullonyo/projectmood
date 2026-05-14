import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/context";
import { ScaleProvider } from "@/lib/contexts/ScaleProvider";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { SessionProvider } from "@/components/auth/session-provider";

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
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://moodspace.com.br'),
  title: {
    default: "MoodSpace — Crie seu mural estético e compartilhe seu mood",
    template: "%s — MoodSpace"
  },
  description: "Crie e compartilhe seu mural pessoal estético e imersivo no MoodSpace. Aesthetic moods, músicas, GIFs, contagens regressivas e muito mais. Curate Your Reality.",
  keywords: ["moodboard", "aesthetic", "creative space", "personal profile", "moodspace", "mural pessoal"],
  authors: [{ name: "MoodSpace Team" }],
  creator: "MoodSpace",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://moodspace.com.br",
    siteName: "MoodSpace",
    title: "MoodSpace — Crie seu mural estético e compartilhe seu mood",
    description: "Crie e compartilhe seu mural pessoal estético e imersivo. Aesthetic moods, músicas, GIFs e muito mais.",
    images: [
      {
        url: "https://moodspace.com.br/og-base.png",
        width: 1200,
        height: 630,
        alt: "MoodSpace — Curate Your Reality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodSpace — Crie seu mural estético e compartilhe seu mood",
    description: "Crie e compartilhe seu mural pessoal estético e imersivo. Aesthetic moods, músicas, GIFs e muito mais.",
    images: ["https://moodspace.com.br/og-base.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import { STUDIO_THEME } from "@/lib/studio-theme";

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
        <SessionProvider>
          <GoogleOneTap />
          <I18nProvider>
            <ScaleProvider>
              {children}
            </ScaleProvider>
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: STUDIO_THEME.colors.background,
                  backdropFilter: 'blur(16px)',
                  border: `${STUDIO_THEME.ui.borderWidth} solid ${STUDIO_THEME.colors.border}`,
                  color: STUDIO_THEME.colors.foreground,
                  borderRadius: '0px',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                },
                className: STUDIO_THEME.typography.fontMono,
              }}
            />
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
