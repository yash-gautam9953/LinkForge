import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LinkForge — URL Shortener",
  description: "Shorten links fast with a clean, modern UI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -bottom-40 right-[-120px] h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
        </div>

        <Navbar />

        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-sm text-slate-400 sm:px-6">
          <div className="flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-slate-300">LinkForge</span> ·
              Built with Next.js
            </div>
            <div className="text-slate-500">
              Made by <span className="text-slate-300">Yash Gautam</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
