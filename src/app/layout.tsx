import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Catatanku",
  description: "Kelola keuangan pribadi & keluarga dengan cerdas",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Catatanku" },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-body-md bg-[#fef9f0] text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
