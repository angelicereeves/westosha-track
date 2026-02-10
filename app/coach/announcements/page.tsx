// app/coach/announcements/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireRole } from "@/lib/useRequireRole";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published_at: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CoachAnnouncementsPage() {
  const router = useRouter();
  const { ready } = useRequireRole("coach");

  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("announcements")
      .select("id,title,body,pinned,published_at")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(100);

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? (data as Announcement[]) : []);
    }

    setLoading(false);
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Please add a title.");
    if (!body.trim()) return setError("Please add the announcement text.");

    setSaving(true);

    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr) {
      setSaving(false);
      setError(sessionErr.message);
      return;
    }

    if (!session) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("announcements").insert([
      {
        title: title.trim(),
        body: body.trim(),
        pinned,
        created_by: session.user.id,
        // If your table sets published_at by default, you can remove this.
        published_at: new Date().toISOString(),
      },
    ]);

    setSaving(false);

    if (error) return setError(error.message);

    setTitle("");
    setBody("");
    setPinned(false);
    await load();
  }

  async function togglePin(id: string, nextPinned: boolean) {
    setError(null);

    const { error } = await supabase
      .from("announcements")
      .update({ pinned: nextPinned })
      .eq("id", id);

    if (error) return setError(error.message);

    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;

    setError(null);

    const { error } = await supabase.from("announcements").delete().eq("id", id);

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
              Announcements Manager
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Create updates for the public site. Pin important posts.
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
          <h2 className="text-lg font-extrabold text-slate-900">Create Post</h2>

          <form onSubmit={createPost} className="mt-4 space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                placeholder="Ex: Meet day reminders"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-900">Body</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-lg border border-[#C0C0C0] p-2.5 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#7A0019]/40"
                placeholder="Write the announcement here…"
              />
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <span className="text-sm font-semibold text-slate-900">
                Pin this post
              </span>
            </label>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              disabled={saving}
              className="rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Posting…" : "Publish announcement"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Posts</h2>

          {loading ? (
            <p className="mt-3 text-slate-700">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="mt-3 text-slate-600">No announcements yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {rows.map((a) => (
                <article
                  key={a.id}
                  className="rounded-xl border border-[#C0C0C0] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-600">
                        {formatDate(a.published_at)}
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                        {a.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.pinned ? (
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border border-[#7A0019]/30 bg-[#7A0019]/10 text-[#7A0019]">
                          PINNED
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-3 text-slate-700 whitespace-pre-wrap">{a.body}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => togglePin(a.id, !a.pinned)}
                      className="rounded-lg border border-[#C0C0C0] bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      {a.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => remove(a.id)}
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
