// app/coach/schedule/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";
import { useRouter } from "next/navigation";

type EventType = "practice" | "meet";

type ScheduleEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS or HH:MM
  type: EventType;
  title: string;
  location: string | null;
  notes: string | null;
};

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeTime(t: string | null) {
  if (!t) return "";
  return t.slice(0, 5);
}

export default function CoachSchedulePage() {
  const router = useRouter();
  const { ready } = useRequireRole("coach");
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<ScheduleEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState(""); // HH:MM
  const [type, setType] = useState<EventType>("practice");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("schedule_events")
      .select("id,date,start_time,type,title,location,notes")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? (data as ScheduleEvent[]) : []);
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setDate("");
    setStartTime("");
    setType("practice");
    setTitle("");
    setLocation("");
    setNotes("");
  }

  function startEdit(ev: ScheduleEvent) {
    setEditingId(ev.id);
    setDate(ev.date);
    setStartTime(normalizeTime(ev.start_time));
    setType(ev.type);
    setTitle(ev.title);
    setLocation(ev.location ?? "");
    setNotes(ev.notes ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date) return setError("Please choose a date.");
    if (!title.trim()) return setError("Please add a title.");

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

    const payload = {
      date,
      start_time: startTime ? `${startTime}:00` : null,
      type,
      title: title.trim(),
      location: location.trim() ? location.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
      created_by: user.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("schedule_events")
        .update(payload)
        .eq("id", editingId);

      setSaving(false);

      if (error) return setError(error.message);

      resetForm();
      await load();
      return;
    }

    const { error } = await supabase.from("schedule_events").insert([payload]);

    setSaving(false);

    if (error) return setError(error.message);

    resetForm();
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;

    setError(null);

    const { error } = await supabase.from("schedule_events").delete().eq("id", id);

    if (error) return setError(error.message);

    await load();
  }

  useEffect(() => {
    if (ready) load();
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
        <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
          <div className="px-6 py-5 bg-[#7A0019]">
            <h1 className="text-3xl font-extrabold text-white">
              Schedule Manager
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Add and edit practices and meets.
            </p>
          </div>
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.push("/coach")}
              className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to Coach Portal
            </button>
            <button
              onClick={load}
              className="rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Refresh
            </button>
          </div>
        </header>

        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {isEditing ? "Edit Event" : "Add Event"}
          </h2>

          <form onSubmit={save} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">
                Start time (optional)
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
              >
                <option value="practice">Practice</option>
                <option value="meet">Meet</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                placeholder="After-school practice / Invite meet / etc."
                required
              />
            </label>

            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-900">
                Location (optional)
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                placeholder="Track / Stadium / Away school..."
              />
            </label>

            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-900">
                Notes (optional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                placeholder="Arrive time, uniform, bus time, etc."
              />
            </label>

            {error ? (
              <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-wrap gap-3 justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
              >
                Clear
              </button>

              <button
                disabled={saving}
                className="rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : isEditing ? "Save changes" : "Add event"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Upcoming Events</h2>

          {loading ? (
            <p className="mt-3 text-slate-700">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="mt-3 text-slate-600">No events yet. Add one above.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {rows.map((ev) => (
                <article key={ev.id} className="rounded-xl border border-[#C0C0C0] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-600">
                        {fmtDate(ev.date)}
                        {ev.start_time ? ` • ${normalizeTime(ev.start_time)}` : ""}
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                        {ev.title}
                      </h3>
                      {ev.location ? (
                        <p className="mt-1 text-sm text-slate-600">
                          Location:{" "}
                          <span className="font-semibold">{ev.location}</span>
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                        ev.type === "meet"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {ev.type.toUpperCase()}
                    </span>
                  </div>

                  {ev.notes ? (
                    <p className="mt-3 text-slate-700 whitespace-pre-wrap">
                      <span className="font-semibold">Notes:</span> {ev.notes}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(ev)}
                      className="rounded-lg border border-[#C0C0C0] bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(ev.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
