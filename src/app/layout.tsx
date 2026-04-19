import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SkillsSense — 說出你想做的事，找到最適合的 Skill",
    template: "%s | SkillsSense",
  },
  description:
    "AI 驅動的 skill 發現平台：解析你的需求、推薦工具、生成教程。解決「不會找、不會用、不敢信」的痛點。輸入自然語言，30 秒內獲得個性化技能推薦和詳細教程。",
  keywords: [
    "AI skill finder",
    "AI tools discovery",
    "skill recommendation",
    "AI tutorial generator",
    "find AI tools by describing problem",
    "ChatGPT alternatives",
    "AI learning platform",
    "skill discovery platform",
  ],
  authors: [{ name: "SkillsSense" }],
  creator: "SkillsSense",
  publisher: "SkillsSense",
  metadataBase: new URL("https://skillssense.com"),
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://skillssense.com",
    siteName: "SkillsSense",
    title: "SkillsSense — 說出你想做的事，找到最適合的 Skill",
    description:
      "AI 驅動的 skill 發現平台：解析你的需求、推薦工具、生成教程。輸入自然語言，30 秒內獲得個性化推薦。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkillsSense - AI-Powered Skill Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillsSense — 說出你想做的事，找到最適合的 Skill",
    description:
      "AI 驅動的 skill 發現平台：解析你的需求、推薦工具、生成教程。",
    images: ["/og-image.png"],
    creator: "@skillssense",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://skillssense.com",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');
        `}
      </Script>
      <ThemeProvider>{children}</ThemeProvider>
    </body>
    </html>
  );
}
