// app/coach/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";

export default function CoachPage() {
  const router = useRouter();
  const { ready } = useRequireRole("coach");
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
        {/* Header */}
        <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
          <div className="px-6 py-5 bg-[#7A0019]">
            <h1 className="text-3xl font-extrabold text-white">Coach Portal</h1>
            <p className="text-sm text-white/80 mt-1">
              Signed in as {email ?? "—"}
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="text-slate-700">
              Manage athletes, review reflections, track attendance, and update
              team resources.
            </p>
          </div>
        </header>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Schedule */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Schedule</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add and edit practices and meets shown on the public site.
            </p>
            <button
              onClick={() => router.push("/coach/schedule")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Edit schedule
            </button>
          </section>

          {/* Announcements */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Announcements</h2>
            <p className="mt-2 text-sm text-slate-600">
              Post updates to the public announcements page and pin important
              items.
            </p>
            <button
              onClick={() => router.push("/coach/announcements")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Manage announcements
            </button>
          </section>

          {/* Attendance */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Attendance</h2>
            <p className="mt-2 text-sm text-slate-600">
              View daily check-ins and notes. Filter by date.
            </p>
            <button
              onClick={() => router.push("/coach/attendance")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              View attendance
            </button>
          </section>

          {/* Reflections */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Reflections</h2>
            <p className="mt-2 text-sm text-slate-600">
              View daily reflections and filter by athlete or date.
            </p>
            <button
              onClick={() => router.push("/coach/reflections")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              View reflections
            </button>
          </section>

          {/* Docs */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Documents</h2>
            <p className="mt-2 text-sm text-slate-600">
              Upload and manage forms, handbooks, and meet-day documents.
            </p>
            <button
              onClick={() => router.push("/coach/docs")}
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Manage documents
            </button>
          </section>

          {/* Roster (next) */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">Roster</h2>
            <p className="mt-2 text-sm text-slate-600">
              Invite athletes and organize by event group. (We’ll build this
              after the core site is complete.)
            </p>
            <button
              onClick={() => alert("Roster management is next!")}
              className="mt-4 inline-flex rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Manage roster (next)
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
