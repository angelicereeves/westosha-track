// app/coach/attendance/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";

type AttendanceStatus = "present" | "late" | "absent" | "injured";

type CoachAttendanceRow = {
  id: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
  athlete_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    event_group: string | null;
  } | null;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function pillClass(status: AttendanceStatus) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border";
  switch (status) {
    case "present":
      return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
    case "late":
      return `${base} border-amber-200 bg-amber-50 text-amber-800`;
    case "absent":
      return `${base} border-red-200 bg-red-50 text-red-700`;
    case "injured":
    default:
      return `${base} border-slate-200 bg-slate-50 text-slate-800`;
  }
}

function displayName(r: CoachAttendanceRow) {
  const first = r.profiles?.first_name ?? "";
  const last = r.profiles?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return full.length ? full : `Athlete (${r.athlete_id.slice(0, 6)}…)`;
}

export default function CoachAttendancePage() {
  const router = useRouter();
  const { ready } = useRequireRole("coach");

  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<CoachAttendanceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(selectedDate: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
          id,
          date,
          status,
          note,
          created_at,
          athlete_id,
          profiles:athlete_id (
            first_name,
            last_name,
            event_group
          )
        `
      )
      .eq("date", selectedDate)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? (data as CoachAttendanceRow[]) : []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (ready) load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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
            <h1 className="text-3xl font-extrabold text-white">Attendance</h1>
            <p className="text-sm text-white/80 mt-1">Date: {date}</p>
          </div>

          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.push("/coach")}
              className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to Coach Portal
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-900">Date</label>
              <input
                className="rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button
                onClick={() => load(date)}
                className="rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                Load
              </button>
            </div>
          </div>
        </header>

        {/* Error */}
        {error ? (
          <div className="rounded-2xl bg-white shadow-sm border border-red-200 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {/* Body */}
        {loading ? (
          <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <p className="text-slate-700">Loading attendance…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
            <p className="text-slate-700">No check-ins for this date yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {displayName(r)}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Event: {r.profiles?.event_group ?? "—"}
                    </p>
                  </div>

                  <span className={pillClass(r.status)}>
                    {r.status.toUpperCase()}
                  </span>
                </div>

                {r.note ? (
                  <p className="mt-3 text-slate-700 whitespace-pre-wrap">
                    <span className="font-semibold">Note:</span> {r.note}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
