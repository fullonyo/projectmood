import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/context";
import { ScaleProvider } from "@/lib/contexts/ScaleProvider";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { SessionProvider } from "@/components/auth/session-provider";
import { STUDIO_THEME } from "@/lib/studio-theme";
import { getPublicSiteUrl } from "@/lib/public-site-url";
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
const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MoodSpace — Crie seu mural estético e compartilhe seu mood",
    template: "%s — MoodSpace"
  },
  description: "Crie seu espaço digital no MoodSpace. Um mural pessoal para organizar suas memórias, músicas e conexões de forma criativa e imersiva.",
  keywords: ["moodboard", "aesthetic", "creative space", "personal profile", "moodspace", "mural pessoal"],
  authors: [{ name: "MoodSpace Team" }],
  creator: "MoodSpace",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "MoodSpace",
    title: "MoodSpace — Crie seu mural estético e compartilhe seu mood",
    description: "Crie seu espaço digital no MoodSpace. Um mural pessoal para organizar suas memórias, músicas e conexões de forma criativa e imersiva.",
    images: [
      {
        url: `${siteUrl}/og-base.png`,
        width: 1200,
        height: 630,
        alt: "MoodSpace — Curate Your Reality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodSpace — Crie seu mural estético e compartilhe seu mood",
    description: "Crie seu espaço digital no MoodSpace. Um mural pessoal para organizar suas memórias, músicas e conexões de forma criativa e imersiva.",
    images: [`${siteUrl}/og-base.png`],
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
    <html lang="pt-BR">
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
