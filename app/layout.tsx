import type { Metadata, Viewport } from "next";
import "./globals.css";
import { createServerSupabaseClient } from "@wheewise/supabase/server";
import { HeaderSignOut } from "./HeaderSignOut";

const APP_URL = process.env.APP_URL || "https://association.wheewise.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Wheewise Association",
  description: "Oversight dashboard for Wheewise dealer associations.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Wheewise Association" },
  openGraph: {
    title: "Wheewise Association",
    description: "Oversight dashboard for Wheewise dealer associations.",
    siteName: "Wheewise Association",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="flex items-center justify-between border-b border-border-default px-6 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.png" alt="Wheewise" className="h-8 w-auto" />
          {user ? <HeaderSignOut /> : null}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
