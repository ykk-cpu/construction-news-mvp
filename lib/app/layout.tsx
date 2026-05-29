import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "建設業界ニュース",
  description: "建設業界のニュースを毎日チェックするためのMVPサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
