import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KodzenIdiaa - AI Destekli Iddaa Tahmin Platformu",
  description:
    "Yapay zeka ile mac sonucu, toplam gol, karsilikli gol ve diger kriterleri yuksek isabetle tahmin edin. Canli maclar, istatistikler ve detayli analizler.",
  keywords: ["iddaa", "tahmin", "yapay zeka", "mac sonucu", "canli mac", "bahis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">
        <Navbar />
        <main className="flex-1 pt-16 md:pt-16 pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
