// app/(public)/schedule/page.tsx
type ScheduleItem = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // "3:30 PM"
  type: "Practice" | "Meet";
  title: string;
  location?: string;
  notes?: string;
};

const demoSchedule: ScheduleItem[] = [
  {
    id: "1",
    date: "2026-03-09",
    time: "3:30 PM",
    type: "Practice",
    title: "After-school practice",
    location: "Track",
    notes: "Warm-up + sprint mechanics",
  },
  {
    id: "2",
    date: "2026-03-12",
    time: "4:00 PM",
    type: "Meet",
    title: "Invite Meet (Varsity)",
    location: "Central HS Stadium",
    notes: "Arrive 3:15 PM, uniform required",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
        <div className="px-6 py-5 bg-[#7A0019]">
          <h1 className="text-3xl font-extrabold text-white">Schedule</h1>
          <p className="text-sm text-white/80 mt-1">
            Practices and meets for the season.
          </p>
        </div>
        <div className="px-6 py-4 text-slate-700">
          This page will become live data later. For now it’s a clean placeholder.
        </div>
      </header>

      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
        <div className="space-y-4">
          {demoSchedule.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#C0C0C0] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-600">
                    {formatDate(item.date)} {item.time ? `• ${item.time}` : ""}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                    {item.title}
                  </h2>
                  {item.location ? (
                    <p className="mt-1 text-sm text-slate-600">
                      Location: <span className="font-semibold">{item.location}</span>
                    </p>
                  ) : null}
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                    item.type === "Meet"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {item.type.toUpperCase()}
                </span>
              </div>

              {item.notes ? (
                <p className="mt-3 text-slate-700 whitespace-pre-wrap">
                  <span className="font-semibold">Notes:</span> {item.notes}
                </p>
              ) : null}
            </article>
          ))}

          <p className="text-sm text-slate-500">
            Next: we’ll connect this to Supabase so coaches can add/edit events.
          </p>
        </div>
      </section>
    </div>
  );
}
