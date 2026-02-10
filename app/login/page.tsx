// app/login/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) return setErr(error.message);

    // ✅ ensure server components see the new session cookie
    router.refresh();
    router.push("/redirect");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
          <div className="px-6 py-5 bg-[#7A0019]">
            <h1 className="text-2xl font-extrabold text-white">
              Westosha Track & Field
            </h1>
            <p className="text-sm text-white/80 mt-1">Portal Login</p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Email</span>
              <input
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@school.org"
                autoComplete="email"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">
                Password
              </span>
              <input
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            <button
              className="w-full rounded-lg bg-[#7A0019] px-4 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {err ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            <p className="text-xs text-slate-500">
              If you have trouble signing in, contact your coach.
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Westosha Track & Field
        </p>
      </div>
    </main>
  );
}
