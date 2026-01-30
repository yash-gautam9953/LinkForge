"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const [auth, setAuth] = useState({ loading: true, authenticated: false });
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(null);

  const host = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_HOST || "";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const me = await fetch("/api/me", { cache: "no-store" }).then((r) =>
          r.json(),
        );

        if (cancelled) return;

        if (!me?.authenticated) {
          setAuth({ loading: false, authenticated: false });
          return;
        }

        setAuth({ loading: false, authenticated: true, user: me.user });

        const res = await fetch("/api/urls", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setStatus({ type: "error", message: "Failed to load links" });
          return;
        }
        setItems(data.urls || []);
      } catch {
        setStatus({ type: "error", message: "Failed to load" });
        setAuth({ loading: false, authenticated: false });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (auth.loading) {
    return <div className="text-slate-300">Loading your links…</div>;
  }

  if (!auth.authenticated) {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-semibold">My Links</h1>
          <p className="mt-2 text-slate-300">
            Please login to see your saved short links.
          </p>
          <Link
            href="/login?next=/dashboard"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">My Links</h1>
          <p className="mt-1 text-sm text-slate-300">
            Logged in as{" "}
            <span className="text-slate-100">{auth.user?.name}</span>
          </p>
        </div>
        <Link
          href="/shorten"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
        >
          + New link
        </Link>
      </div>

      {status && (
        <div
          className={
            "mb-4 rounded-xl border px-4 py-3 text-sm " +
            (status.type === "success"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              : "border-rose-400/20 bg-rose-500/10 text-rose-200")
          }
        >
          {status.message}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {items.length === 0 ? (
          <div className="p-6 text-slate-300">
            No links yet. Create one from{" "}
            <Link className="text-cyan-200 hover:underline" href="/shorten">
              /shorten
            </Link>
            .
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((item) => {
              const shortFull = `${host}/${item.shortUrl}`;
              return (
                <div key={item.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <a
                        className="break-all text-base font-semibold text-cyan-200 hover:underline"
                        href={shortFull}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortFull}
                      </a>
                      <div className="mt-1 break-all text-sm text-slate-300">
                        → {item.url}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shortFull);
                          setStatus({ type: "success", message: "Copied." });
                        } catch {
                          setStatus({ type: "error", message: "Copy failed." });
                        }
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
