// app/portal/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";

type AttendanceStatus = "present" | "late" | "absent" | "injured";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AthletePortalPage() {
  const router = useRouter();
  const { ready } = useRequireRole("athlete");
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState<string | null>(null);

  // Attendance state
  const [attLoading, setAttLoading] = useState(true);
  const [attSaving, setAttSaving] = useState(false);
  const [attError, setAttError] = useState<string | null>(null);
  const [attSuccess, setAttSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [note, setNote] = useState("");

  const dateStr = useMemo(() => todayISO(), []);

  // Load signed-in email
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

  // Load today's attendance for this athlete
  useEffect(() => {
    let cancelled = false;

    async function loadTodayAttendance() {
      setAttLoading(true);
      setAttError(null);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userErr || !user) {
        setAttLoading(false);
        router.replace("/login");
        return;
      }

      const athleteId = user.id;

      const { data, error } = await supabase
        .from("attendance")
        .select("status,note")
        .eq("date", dateStr)
        .eq("athlete_id", athleteId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setAttError(error.message);
      } else if (data) {
        setStatus(data.status as AttendanceStatus);
        setNote(data.note ?? "");
      }

      setAttLoading(false);
    }

    if (ready) loadTodayAttendance();

    return () => {
      cancelled = true;
    };
  }, [ready, router, dateStr, supabase]);

  async function saveAttendance(nextStatus: AttendanceStatus) {
    setAttError(null);
    setAttSuccess(null);
    setAttSaving(true);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setAttSaving(false);
      router.replace("/login");
      return;
    }

    const athleteId = user.id;

    // upsert so they can change it once/day without creating duplicates
    const { error } = await supabase.from("attendance").upsert(
      [
        {
          athlete_id: athleteId,
          date: dateStr,
          status: nextStatus,
          note: note.trim() ? note.trim() : null,
        },
      ],
      { onConflict: "athlete_id,date" }
    );

    setAttSaving(false);

    if (error) {
      setAttError(error.message);
      return;
    }

    setStatus(nextStatus);
    setAttSuccess("Attendance saved!");
    window.setTimeout(() => setAttSuccess(null), 1500);
  }

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

  const statusLabel =
    status === "present"
      ? "Present"
      : status === "late"
      ? "Late"
      : status === "absent"
      ? "Absent"
      : status === "injured"
      ? "Injured"
      : "Not checked in";

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
              Submit your daily reflection and check in for attendance.
            </p>
          </div>
        </header>

        {/* Attendance (on portal homepage) */}
        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendance Check-In</h2>
              <p className="text-sm text-slate-600 mt-1">
                Today: <span className="font-semibold">{dateStr}</span> •{" "}
                <span className="font-semibold">{statusLabel}</span>
              </p>
            </div>

            <button
              onClick={() => router.push("/portal/reflections/new")}
              className="inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Daily Reflection
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {(
              [
                ["present", "Present"],
                ["late", "Late"],
                ["absent", "Absent"],
                ["injured", "Injured"],
              ] as Array<[AttendanceStatus, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                disabled={attSaving || attLoading}
                onClick={() => saveAttendance(key)}
                className={`rounded-lg border px-4 py-2 font-semibold hover:bg-slate-50 disabled:opacity-60 ${
                  status === key
                    ? "border-[#7A0019] bg-[#7A0019] text-white"
                    : "border-[#C0C0C0] bg-white text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="mt-4 block space-y-1">
            <span className="text-sm font-semibold text-slate-900">
              Note (optional)
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
              placeholder="Ex: Doctor appt, sore hamstring, arriving 10 min late…"
            />
          </label>

          {attLoading ? (
            <p className="mt-3 text-sm text-slate-600">Loading today’s status…</p>
          ) : null}

          {attError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {attError}
            </div>
          ) : null}

          {attSuccess ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {attSuccess}
            </div>
          ) : null}
        </section>

        {/* Cards */}
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
            <h2 className="text-lg font-bold text-slate-900">My Reflection History</h2>
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

          {/* Documents */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Documents</h2>
            <p className="mt-2 text-sm text-slate-600">
              View and download required team documents.
            </p>
            <a
              href="/docs"
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              View documents
            </a>
          </section>

          {/* Schedule */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Schedule</h2>
            <p className="mt-2 text-sm text-slate-600">
              View practices, meets, and upcoming events.
            </p>
            <a
              href="/schedule"
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              View schedule
            </a>
          </section>

          {/* Announcements */}
          <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <h2 className="text-lg font-bold text-slate-900">Announcements</h2>
            <p className="mt-2 text-sm text-slate-600">
              Stay up to date with team news and important updates.
            </p>
            <a
              href="/announcements"
              className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              View announcements
            </a>
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
