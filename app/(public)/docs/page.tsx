// app/(public)/docs/page.tsx
type DocItem = {
  id: string;
  title: string;
  description?: string;
  href: string; // later will be Supabase Storage links
};

const docs = {
  "Athletic Forms": [
    {
      id: "f1",
      title: "Physical Form (PDF)",
      description: "Required before first competition.",
      href: "#",
    },
    {
      id: "f2",
      title: "Emergency Contact Form",
      description: "Complete and return to coach.",
      href: "#",
    },
  ] as DocItem[],
  Handbooks: [
    {
      id: "h1",
      title: "Team Handbook",
      description: "Expectations, rules, grading/eligibility, etc.",
      href: "#",
    },
  ] as DocItem[],
  "Meet Day": [
    {
      id: "m1",
      title: "Meet-Day Checklist",
      description: "Uniform, spikes, nutrition, warm-up plan.",
      href: "#",
    },
  ] as DocItem[],
};

export default function DocsPage() {
  const sections = Object.entries(docs);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] overflow-hidden">
        <div className="px-6 py-5 bg-[#7A0019]">
          <h1 className="text-3xl font-extrabold text-white">Forms &amp; Docs</h1>
          <p className="text-sm text-white/80 mt-1">
            Important team documents and resources.
          </p>
        </div>
        <div className="px-6 py-4 text-slate-700">
          Links are placeholders for now. Later we’ll connect to Supabase Storage.
        </div>
      </header>

      <div className="grid gap-6">
        {sections.map(([sectionTitle, items]) => (
          <section
            key={sectionTitle}
            className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6"
          >
            <h2 className="text-xl font-extrabold text-slate-900">{sectionTitle}</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {items.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.href}
                  className="rounded-xl border border-[#C0C0C0] p-4 hover:bg-slate-50"
                >
                  <h3 className="font-extrabold text-slate-900">{doc.title}</h3>
                  {doc.description ? (
                    <p className="mt-1 text-sm text-slate-600">{doc.description}</p>
                  ) : null}
                  <p className="mt-3 text-sm font-semibold text-[#7A0019]">
                    Open →
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
