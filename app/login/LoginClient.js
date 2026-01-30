"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginClient({ defaultNextUrl = "/dashboard" }) {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search?.get("next") || defaultNextUrl;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const disabled = useMemo(() => {
    return isLoading || !name.trim() || password.length < 4;
  }, [isLoading, name, password]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        setStatus({ type: "error", message: data?.message || "Login failed" });
        return;
      }

      setStatus({ type: "success", message: data?.message || "Logged in" });
      router.push(nextUrl);
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Network error. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
        <h1 className="text-2xl font-semibold text-slate-100">Login</h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter your name and password. If the user doesn’t exist, it will be
          created.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
              placeholder="yash"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="••••"
              autoComplete="current-password"
            />
            <p className="mt-2 text-xs text-slate-400">Minimum 4 characters.</p>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className={
              "w-full rounded-xl px-5 py-3 text-base font-semibold text-white transition " +
              (disabled
                ? "cursor-not-allowed bg-white/10 text-slate-300"
                : "bg-violet-600 hover:bg-violet-500")
            }
          >
            {isLoading ? "Signing in…" : "Continue"}
          </button>

          {status && (
            <div
              className={
                "rounded-xl border px-4 py-3 text-sm " +
                (status.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/20 bg-rose-500/10 text-rose-200")
              }
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
