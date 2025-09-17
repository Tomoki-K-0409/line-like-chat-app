import type { Metadata } from "next";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LINE Chat App",
  description: "A simple LINE-like chat application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
