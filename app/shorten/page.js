"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Shorten = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState({ loading: true, authenticated: false });

  const host = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_HOST || "";
  }, []);

  const urlError = useMemo(() => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "URL must start with http:// or https://";
      }
      return null;
    } catch {
      return "Enter a valid URL";
    }
  }, [url]);

  const slugError = useMemo(() => {
    if (!shortUrl) return null;
    if (shortUrl.length < 3) return "Short text must be at least 3 characters";
    if (shortUrl.length > 40) return "Short text must be 40 characters or less";
    if (!/^[a-zA-Z0-9_-]+$/.test(shortUrl)) {
      return "Use only letters, numbers, - and _";
    }
    return null;
  }, [shortUrl]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const me = await fetch("/api/me", { cache: "no-store" }).then((r) =>
          r.json(),
        );
        if (cancelled) return;
        setAuth({ loading: false, authenticated: Boolean(me?.authenticated) });
      } catch {
        if (cancelled) return;
        setAuth({ loading: false, authenticated: false });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const generate = async () => {
    setStatus(null);
    setGeneratedUrl("");

    if (!url || !shortUrl) {
      setStatus({ type: "error", message: "Please fill in both fields." });
      return;
    }
    if (urlError || slugError) {
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields.",
      });
      return;
    }

    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      url: url,
      shortUrl: shortUrl,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch("/api/generate", requestOptions);
      const result = await response.json();

      if (response.status === 401) {
        setStatus({
          type: "error",
          message: "Please login to save your links.",
        });
        router.push("/login?next=/shorten");
        return;
      }

      if (!response.ok || result?.success === false) {
        setStatus({
          type: "error",
          message: result?.message || "Something went wrong.",
        });
        return;
      }

      const finalUrl = `${host}/${shortUrl}`;
      setGeneratedUrl(finalUrl);
      setStatus({
        type: "success",
        message: result?.message || "Short URL created.",
      });
      setUrl("");
      setShortUrl("");
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-center text-4xl font-semibold text-transparent sm:text-5xl">
          Shorten a link
        </h1>
        <p className="mt-3 text-center text-slate-300">
          Paste a long URL, choose a short path, and share instantly.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
        <div className="grid gap-4">
          {!auth.loading && !auth.authenticated && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Login is required so your links are saved and visible later in{" "}
              <Link className="underline underline-offset-4" href="/dashboard">
                My Links
              </Link>
              .{" "}
              <Link
                className="ml-2 font-semibold underline underline-offset-4"
                href="/login?next=/shorten"
              >
                Login
              </Link>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Destination URL
            </label>
            <input
              value={url}
              type="url"
              inputMode="url"
              autoComplete="off"
              className={
                "w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 " +
                (urlError ? "border-rose-500/50" : "border-white/10")
              }
              placeholder="https://example.com/very/long/link"
              onChange={(e) => setUrl(e.target.value)}
            />
            {urlError && (
              <p className="mt-2 text-sm text-rose-300">{urlError}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Short text
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <input
                  value={shortUrl}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  className={
                    "w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-500/20 " +
                    (slugError ? "border-rose-500/50" : "border-white/10")
                  }
                  placeholder="my-link"
                  onChange={(e) => setShortUrl(e.target.value.trim())}
                />
                {slugError && (
                  <p className="mt-2 text-sm text-rose-300">{slugError}</p>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300 sm:min-w-[220px]">
                Preview:{" "}
                <span className="text-slate-100">
                  {host || "your-site"}/{shortUrl || "..."}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={isLoading}
              className={
                "inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold text-white shadow-sm transition " +
                (isLoading
                  ? "cursor-not-allowed bg-white/10 text-slate-300"
                  : "bg-violet-600 hover:bg-violet-500 shadow-violet-600/20")
              }
              onClick={generate}
            >
              {isLoading ? "Generating…" : "Generate"}
            </button>

            <p className="text-sm text-slate-400">
              Tip: keep it short and memorable.
            </p>
          </div>

          {status && (
            <div
              className={
                "mt-2 rounded-xl border px-4 py-3 text-sm " +
                (status.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/20 bg-rose-500/10 text-rose-200")
              }
            >
              {status.message}
            </div>
          )}

          {generatedUrl && (
            <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="text-sm font-medium text-slate-200">
                Your short URL
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href={generatedUrl}
                  className="break-all text-base font-semibold text-cyan-200 underline-offset-4 hover:underline"
                >
                  {generatedUrl}
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generatedUrl);
                      setStatus({
                        type: "success",
                        message: "Copied to clipboard.",
                      });
                    } catch {
                      setStatus({
                        type: "error",
                        message: "Couldn't copy. Please copy manually.",
                      });
                    }
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Shorten;
