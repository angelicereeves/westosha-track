// app/(public)/announcements/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export const dynamic = "force-dynamic";



type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published_at: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AnnouncementsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,pinned,published_at")
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(50);

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? (data as Announcement[]) : []);
      }

      setLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const pinned = useMemo(() => rows.filter((r) => r.pinned), [rows]);
  const regular = useMemo(() => rows.filter((r) => !r.pinned), [rows]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
        <div className="px-6 py-5 bg-[#7A0019]">
          <h1 className="text-3xl font-extrabold text-white">Announcements</h1>
          <p className="text-sm text-white/80 mt-1">
            Updates and reminders from the coaching staff.
          </p>
        </div>
        <div className="px-6 py-4 text-slate-700">
          {loading ? "Loading announcements…" : "Check back often for updates."}
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl bg-white shadow-sm border border-red-200 p-6 text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && rows.length === 0 ? (
        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            No announcements yet
          </h2>
          <p className="mt-2 text-slate-600">
            Coaches will post updates here as the season starts.
          </p>
        </section>
      ) : null}

      {pinned.length ? (
        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Pinned</h2>
          <div className="mt-4 space-y-4">
            {pinned.map((a) => (
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
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border border-[#7A0019]/30 bg-[#7A0019]/10 text-[#7A0019]">
                    PINNED
                  </span>
                </div>

                <p className="mt-3 text-slate-700 whitespace-pre-wrap">
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {regular.length ? (
        <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-lg font-extrabold text-slate-900">All Posts</h2>
          <div className="mt-4 space-y-4">
            {regular.map((a) => (
              <article
                key={a.id}
                className="rounded-xl border border-[#C0C0C0] p-4"
              >
                <p className="text-xs font-bold text-slate-600">
                  {formatDate(a.published_at)}
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                  {a.title}
                </h3>
                <p className="mt-3 text-slate-700 whitespace-pre-wrap">
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
