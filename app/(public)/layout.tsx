import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* NAV BAR */}
      <header className="border-b border-[#C0C0C0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#7A0019] text-white font-extrabold">
              W
            </span>
            <div>
              <div className="font-extrabold text-slate-900 leading-tight">
                Westosha Track & Field
              </div>
              <div className="text-xs text-slate-600">
                Official Team Site
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
  <Link
    href="/schedule"
    className="rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 hover:text-black"
  >
    Schedule
  </Link>

  <Link
    href="/announcements"
    className="rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 hover:text-black"
  >
    Announcements
  </Link>

  <Link
    href="/docs"
    className="rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 hover:text-black"
  >
    Forms & Docs
  </Link>

  <Link
    href="/login"
    className="ml-1 rounded-lg bg-[#7A0019] px-4 py-2 text-white hover:opacity-90"
  >
    Portal Login
  </Link>
</nav>

        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
