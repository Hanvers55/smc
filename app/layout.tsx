import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade Checklist",
  description: "Checklist konfirmasi setup trading per pair, custom rules.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
