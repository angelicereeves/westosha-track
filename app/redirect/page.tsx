// app/redirect/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RedirectPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [msg, setMsg] = useState("Checking your account...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Prefer getUser() for correctness
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userErr || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !profile?.role) {
        setMsg("Could not load your account role.");
        return;
      }

      router.replace(profile.role === "coach" ? "/coach" : "/portal");
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6 text-center w-full max-w-sm">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-[#7A0019]/10 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-[#7A0019]" />
        </div>
        <p className="font-semibold text-slate-900">{msg}</p>
        <p className="text-sm text-slate-600 mt-1">Redirecting…</p>
      </div>
    </main>
  );
}
