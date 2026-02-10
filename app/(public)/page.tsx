// app/(public)/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
        <div className="px-6 py-10 bg-[#7A0019]">
          <h1 className="text-4xl font-extrabold text-white">
            Westosha Track &amp; Field
          </h1>
          <p className="mt-2 text-white/85 text-sm">
            Schedule • Announcements • Forms &amp; Docs • Athlete Portal
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-100"
            >
              View Schedule
            </Link>
            <Link
              href="/announcements"
              className="rounded-lg bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15 border border-white/30"
            >
              Announcements
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Portal Login
            </Link>
          </div>
        </div>

        <div className="px-6 py-5 bg-white">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#C0C0C0] p-4">
              <p className="text-xs font-bold text-slate-600">NEXT EVENT</p>
              <p className="mt-1 font-extrabold text-slate-900">
                Coming soon
              </p>
              <p className="mt-1 text-sm text-slate-600">
                We’ll show the next practice/meet here.
              </p>
            </div>

            <div className="rounded-xl border border-[#C0C0C0] p-4">
              <p className="text-xs font-bold text-slate-600">LATEST UPDATE</p>
              <p className="mt-1 font-extrabold text-slate-900">
                Coming soon
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Latest coach announcement will appear here.
              </p>
            </div>

            <div className="rounded-xl border border-[#C0C0C0] p-4">
              <p className="text-xs font-bold text-slate-600">FORMS &amp; DOCS</p>
              <p className="mt-1 font-extrabold text-slate-900">
                Team resources
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Physical forms, handbook, meet-day checklist.
              </p>
              <Link
                href="/docs"
                className="mt-3 inline-flex rounded-lg bg-[#7A0019] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Open Documents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            Athlete Portal
          </h2>
          <p className="mt-2 text-slate-600">
            Daily reflections, attendance check-in, and your personal history.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-lg bg-[#7A0019] px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            Portal Login
          </Link>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            Season Info
          </h2>
          <p className="mt-2 text-slate-600">
            Add team expectations, required gear, and meet-day reminders here.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="inline-flex rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Schedule
            </Link>
            <Link
              href="/announcements"
              className="inline-flex rounded-lg border border-[#C0C0C0] bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Announcements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
