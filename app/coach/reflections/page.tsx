// app/coach/reflections/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ReflectionRow = {
  id: string;
  athlete_id: string;
  date: string;
  workout_summary: string | null;
  effort: number | null;
  energy: number | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  event_group: string | null;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CoachReflectionsPage() {
  const supabase = await createClient();

  // ✅ Auth + role guard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (meErr || !me || me.role !== "coach") redirect("/login");

  // ✅ Pull reflections (ONLY columns that exist)
  const { data: reflectionsData, error } = await supabase
    .from("reflections")
    .select("id, athlete_id, date, workout_summary, effort, energy, created_at")
    .order("date", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Athlete Reflections
          </h1>
          <p className="mt-2 text-sm text-red-700">
            Error loading reflections: {error.message}
          </p>

          <Link
            href="/coach"
            className="mt-4 inline-flex rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to Coach Portal
          </Link>
        </div>
      </div>
    );
  }

  const reflections = (reflectionsData ?? []) as ReflectionRow[];

  // ✅ Fetch athlete names (in one query)
  const athleteIds = Array.from(new Set(reflections.map((r) => r.athlete_id)));

  let profilesById: Record<string, ProfileRow> = {};
  if (athleteIds.length) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, event_group")
      .in("id", athleteIds);

    (profilesData ?? []).forEach((p) => {
      profilesById[p.id] = p;
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
        <div className="px-6 py-5 bg-[#7A0019]">
          <h1 className="text-3xl font-extrabold text-white">
            Athlete Reflections
          </h1>
          <p className="text-sm text-white/80 mt-1">
            Review daily reflections submitted by athletes.
          </p>
        </div>

        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/coach"
            className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to Coach Portal
          </Link>

          <div className="text-sm text-slate-700">
            <span className="font-semibold">{reflections.length}</span> total
          </div>
        </div>
      </section>

      {/* List */}
      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
        {reflections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
            No reflections have been submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => {
              const p = profilesById[r.athlete_id];
              const athleteName =
                p?.first_name || p?.last_name
                  ? [p.first_name, p.last_name].filter(Boolean).join(" ")
                  : `Athlete (${r.athlete_id.slice(0, 6)}…)`;

              const preview =
                r.workout_summary?.trim() ||
                (typeof r.effort === "number" ? `Effort: ${r.effort}/10` : "");

              return (
                <Link
                  key={r.id}
                  href={`/coach/reflections/${r.id}`}
                  className="block"
                >
                  <div className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{athleteName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(r.date)}
                          {p?.event_group ? ` • ${p.event_group}` : ""}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-[#7A0019]">
                        View →
                      </span>
                    </div>

                    {preview ? (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {preview}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400 italic">
                        No workout summary provided
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      {typeof r.effort === "number" ? (
                        <span>
                          Effort:{" "}
                          <span className="font-semibold">{r.effort}</span>/10
                        </span>
                      ) : null}
                      {typeof r.energy === "number" ? (
                        <span>
                          Energy:{" "}
                          <span className="font-semibold">{r.energy}</span>/10
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
