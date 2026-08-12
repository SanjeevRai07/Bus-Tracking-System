import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AJU Smart Bus",
  description: "Smart Bus Tracking and Management System",
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