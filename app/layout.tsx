import type { Metadata, Viewport } from "next";
import { Gochi_Hand, Work_Sans } from "next/font/google";
import "./globals.css";

const kapur = Gochi_Hand({ weight: "400", subsets: ["latin"], variable: "--font-gochi" });
const ui = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "Papan Tulis Terima Kasih Guru",
  description: "Tulis ucapanmu buat guru yang paling kamu ingat. Hari Guru Nasional, 25 November.",
};

export const viewport: Viewport = {
  themeColor: "#e6e6d1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${kapur.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
