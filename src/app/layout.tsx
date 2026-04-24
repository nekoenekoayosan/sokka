import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sokka!",
  description: "オンライン学習の復習を能動的に行うWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
