// app/portal/reflections/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";

export default function PortalReflectionsHomePage() {
  const router = useRouter();
  const { ready } = useRequireRole("athlete");
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      setEmail(user?.email ?? null);
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <p className="font-semibold text-slate-900">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
          <div className="px-6 py-5 bg-[#7A0019]">
            <h1 className="text-3xl font-extrabold text-white">Athlete Portal</h1>
            <p className="text-sm text-white/80 mt-1">
              Signed in as {email ?? "—"}
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="text-slate-700">
              Submit your daily reflection and view your personal history.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Daily Reflection</h2>
            <p className="mt-2 text-sm text-slate-600">
              Log what you worked on today and set a focus for tomorrow.
            </p>
            <button
              onClick={() => router.push("/portal/reflections/new")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Submit today’s reflection
            </button>
          </section>

          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">
              My Reflection History
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              View your past entries (only you and your coaches can see these).
            </p>
            <button
              onClick={() => router.push("/portal/reflections")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              View my history
            </button>
          </section>
        </div>

        <div className="flex justify-end">
          <button
            onClick={signOut}
            className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
