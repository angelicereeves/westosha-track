"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type CoachAttendanceRow = {
  id: string;
  date: string;
  status: string;
  note: string | null;
  created_at: string;
  athlete_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    event_group: string | null;
  } | null;
};

export default function CoachAttendancePage() {
  const [rows, setRows] = useState<CoachAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
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
          profiles (
            first_name,
            last_name,
            event_group
          )
        `
        )
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load attendance");
        setRows([]);
        setLoading(false);
        return;
      }

      const incoming = Array.isArray(data) ? data : [];

      const normalized: CoachAttendanceRow[] = incoming.map((r: any) => {
        const profile = Array.isArray(r.profiles)
          ? r.profiles[0]
          : r.profiles;

        return {
          id: r.id,
          date: r.date,
          status: r.status,
          note: r.note ?? null,
          created_at: r.created_at,
          athlete_id: r.athlete_id,
          profiles: profile
            ? {
                first_name: profile.first_name ?? null,
                last_name: profile.last_name ?? null,
                event_group: profile.event_group ?? null,
              }
            : null,
        };
      });

      setRows(normalized);
      setLoading(false);
    };

    fetchAttendance();
  }, []);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-600">
          View athlete attendance by date.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading attendance…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No attendance records found.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  Athlete
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  Event Group
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  Note
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    {row.profiles
                      ? `${row.profiles.first_name ?? ""} ${
                          row.profiles.last_name ?? ""
                        }`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.profiles?.event_group ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.note ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
