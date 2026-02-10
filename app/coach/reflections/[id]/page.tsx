// app/coach/reflections/[id]/page.tsx

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

export default async function CoachReflectionDetailPage({
  params,
}: {
  // ✅ Next 16: params comes in as a Promise in server components
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  // ✅ IMPORTANT: await params
  const { id } = await params;

  if (!id) {
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Reflection</h1>
          <p className="mt-2 text-sm text-red-600">
            Missing reflection id in the route.
          </p>
          <Link
            href="/coach/reflections"
            className="mt-4 inline-flex rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to reflections
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Auth + role guard
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Load reflection (ONLY columns you have)
  // ─────────────────────────────────────────────
  const { data: reflection, error } = await supabase
    .from("reflections")
    .select("id, athlete_id, date, workout_summary, effort, energy, created_at")
    .eq("id", id)
    .single();

  if (error || !reflection) {
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Reflection</h1>
          <p className="mt-2 text-sm text-red-600">
            Could not load that reflection.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            id: {id} • error: {error?.message ?? "unknown"}
          </p>
          <Link
            href="/coach/reflections"
            className="mt-4 inline-flex rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to reflections
          </Link>
        </div>
      </div>
    );
  }

  const r = reflection as ReflectionRow;

  // Athlete info
  const { data: athlete } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, event_group")
    .eq("id", r.athlete_id)
    .single();

  const athleteName =
    athlete?.first_name || athlete?.last_name
      ? [athlete.first_name, athlete.last_name].filter(Boolean).join(" ")
      : `Athlete (${r.athlete_id.slice(0, 6)}…)`;

  return (
    <div className="p-6 space-y-6">
      <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
        <div className="px-6 py-5 bg-[#7A0019]">
          <h1 className="text-3xl font-extrabold text-white">Reflection</h1>
          <p className="text-sm text-white/80 mt-1">
            {athleteName} • {formatDate(r.date)}
            {athlete?.event_group ? ` • ${athlete.event_group}` : ""}
          </p>
        </div>

        <div className="px-6 py-4">
          <Link
            href="/coach/reflections"
            className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to reflections
          </Link>
        </div>
      </header>

      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
        <h2 className="text-lg font-extrabold text-slate-900">Summary</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-500">Effort</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {typeof r.effort === "number" ? `${r.effort}/10` : "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-500">Energy</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {typeof r.energy === "number" ? `${r.energy}/10` : "—"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-extrabold text-slate-900">
            Workout Summary
          </h3>
          {r.workout_summary ? (
            <p className="mt-2 text-slate-700 whitespace-pre-wrap">
              {r.workout_summary}
            </p>
          ) : (
            <p className="mt-2 text-slate-500 italic">No summary provided.</p>
          )}
        </div>
      </section>
    </div>
  );
}
