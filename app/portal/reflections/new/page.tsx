// app/portal/reflections/new/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewReflectionPage() {
  const router = useRouter();
  const { ready } = useRequireRole("athlete");
  const supabase = useMemo(() => createClient(), []);

  const [date, setDate] = useState(todayISO());
  const [workoutSummary, setWorkoutSummary] = useState("");
  const [effort, setEffort] = useState<number>(7);
  const [energy, setEnergy] = useState<number>(7);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!workoutSummary.trim()) {
      setError("Please write a short workout summary.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    // Optional: prevent duplicates for the same day
    const { data: existing, error: existingErr } = await supabase
      .from("reflections")
      .select("id")
      .eq("athlete_id", user.id)
      .eq("date", date)
      .maybeSingle();

    if (existingErr) {
      setSaving(false);
      setError(existingErr.message);
      return;
    }

    if (existing?.id) {
      setSaving(false);
      setError("You already submitted a reflection for this date.");
      return;
    }

    const { error: insertErr } = await supabase.from("reflections").insert([
      {
        athlete_id: user.id,
        date,
        workout_summary: workoutSummary.trim(),
        effort,
        energy,
      },
    ]);

    setSaving(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setSuccess("Reflection submitted!");
    // send them back to history after a short beat
    window.setTimeout(() => router.push("/portal/reflections"), 700);
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
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
          <div className="px-6 py-5 bg-[#7A0019]">
            <h1 className="text-3xl font-extrabold text-white">
              Daily Reflection
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Share what you did today and how you felt.
            </p>
          </div>

          <div className="px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
            <button
              onClick={() => router.push("/portal")}
              className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to Portal
            </button>

            <button
              onClick={() => router.push("/portal/reflections")}
              className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              View My History
            </button>
          </div>
        </header>

        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">
                Workout Summary
              </span>
              <textarea
                value={workoutSummary}
                onChange={(e) => setWorkoutSummary(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                placeholder="What did you do today? Any notes for the coach?"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-900">
                  Effort (1–10)
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-900">
                  Energy (1–10)
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                />
              </label>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {success}
              </div>
            ) : null}

            <button
              disabled={saving}
              className="w-full rounded-lg bg-[#7A0019] px-4 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              type="submit"
            >
              {saving ? "Submitting…" : "Submit reflection"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
