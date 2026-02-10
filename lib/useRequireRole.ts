// lib/useRequireRole.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useRequireRole(role: "coach" | "athlete") {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState(false);

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

      const userId = user.id;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !profile?.role) {
        router.replace("/login");
        return;
      }

      if (profile.role !== role) {
        router.replace(profile.role === "coach" ? "/coach" : "/portal");
        return;
      }

      setReady(true);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [role, router, supabase]);

  return { ready };
}
