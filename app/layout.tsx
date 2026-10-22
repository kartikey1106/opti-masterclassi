import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getGlobalConfiguration } from "@/lib/get-global-config";
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
  title: "DoctorCare POC",
  description: "Healthcare landing page powered by Optimizely CMS",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { isEnabled } = await draftMode();
  const globalConfig = await getGlobalConfiguration({ preview: isEnabled });

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Header settings={globalConfig} />
          <div className="flex-1">{children}</div>
          <Footer settings={globalConfig} />
        </div>
      </body>
    </html>
  );
}
