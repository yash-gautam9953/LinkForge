import LoginClient from "./LoginClient";

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-slate-300">Loading…</div>}>
      <LoginClient defaultNextUrl="/dashboard" />
    </Suspense>
  );
}
