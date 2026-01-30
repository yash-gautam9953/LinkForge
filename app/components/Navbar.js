"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [auth, setAuth] = useState({ loading: true, authenticated: false });

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/shorten", label: "Shorten" },
      { href: "/dashboard", label: "My Links" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const me = await fetch("/api/me", { cache: "no-store" }).then((r) =>
          r.json(),
        );
        if (cancelled) return;
        setAuth({
          loading: false,
          authenticated: Boolean(me?.authenticated),
          user: me?.user || null,
        });
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-slate-100"
          onClick={() => setIsOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950">
            L
          </span>
          <span className="text-lg">LinkForge</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-lg px-3 py-2 text-sm font-medium transition " +
                  (isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white")
                }
              >
                {item.label}
              </Link>
            );
          })}
          {!auth.loading && !auth.authenticated ? (
            <Link
              href="/login?next=/dashboard"
              className="ml-2 inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Login
            </Link>
          ) : (
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                setAuth({ loading: false, authenticated: false });
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!auth.loading && !auth.authenticated ? (
                <Link
                  href="/login?next=/dashboard"
                  className="mt-2 inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              ) : (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    setIsOpen(false);
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
