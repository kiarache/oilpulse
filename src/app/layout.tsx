import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오일펄스 | OilPulse",
  description: "중동 지정학 리스크 · 유가 · 환율 · 에너지 시장 실시간 모니터링 대시보드",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] h-screen overflow-hidden antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
