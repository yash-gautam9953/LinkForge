import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  weight: ["400", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="grid items-center gap-10 py-6 md:grid-cols-2 md:py-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Fast, simple, shareable links
          </div>

          <h1
            className={`text-balance bg-gradient-to-r from-violet-400 via-slate-100 to-cyan-300 bg-clip-text text-4xl font-semibold leading-tight text-transparent sm:text-5xl ${poppins.variable}`}
          >
            A clean URL shortener for your daily sharing
          </h1>
          <p className="max-w-xl text-pretty text-base text-slate-300 sm:text-lg">
            Create branded short links in seconds. Pick a memorable path, copy
            it with one click, and you’re done.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/shorten"
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Shorten a URL
            </Link>
            <Link
              href="/shorten"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              See how it works
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 text-sm text-slate-400">
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              No clutter
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              Custom slugs
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              Copy to clipboard
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">Preview</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-200">
                  Ready
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-400">Long URL</p>
                <p className="mt-1 break-all text-sm text-slate-200">
                  https://example.com/some/very/long/path?utm_source=social
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-400">Short URL</p>
                <p className="mt-1 break-all text-sm font-semibold text-cyan-200">
                  your-site/launch
                </p>
              </div>

              <Link
                href="/shorten"
                className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Create your first link
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
