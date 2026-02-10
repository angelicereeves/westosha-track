import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { downloadDocument } from "./actions";

type DocRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  is_required: boolean;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function buildFilterHref(category: string | null) {
  if (!category) return "/docs";
  return `/docs?category=${encodeURIComponent(category)}`;
}

const CATEGORIES = ["All", "Athletic Forms", "Handbooks", "Meet Day", "Other"] as const;

export default async function DocsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const supabase = await createClient();
  const selectedCategory = searchParams?.category?.trim() || "";

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("is_required", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-[#C0C0C0] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Documents</h1>
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const allDocs = (data || []) as DocRow[];

  const filtered =
    selectedCategory && selectedCategory !== "All"
      ? allDocs.filter((d) => d.category === selectedCategory)
      : allDocs;

  const requiredDocs = filtered.filter((d) => d.is_required);
  const otherDocs = filtered.filter((d) => !d.is_required);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Documents</h1>
        <p className="mt-2 text-sm text-slate-600">
          Download required forms and team documents.
        </p>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active =
              (cat === "All" && !selectedCategory) || selectedCategory === cat;

            const href = cat === "All" ? buildFilterHref(null) : buildFilterHref(cat);

            return (
              <Link
                key={cat}
                href={href}
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border",
                  active
                    ? "bg-[#7A0019] text-white border-[#7A0019]"
                    : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Required */}
      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Required</h2>
          <span className="text-sm text-slate-600">{requiredDocs.length}</span>
        </div>

        {requiredDocs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
            No required documents in this category.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {requiredDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">{doc.title}</p>
                    <span className="rounded-full bg-[#7A0019]/10 px-2 py-0.5 text-xs font-semibold text-[#7A0019]">
                      Required
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {doc.category}
                    </span>
                  </div>

                  {doc.description ? (
                    <p className="mt-1 text-sm text-slate-600">{doc.description}</p>
                  ) : null}

                  <p className="mt-1 text-xs text-slate-500">
                    {doc.file_name}
                    {doc.file_size ? ` • ${formatBytes(doc.file_size)}` : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  {doc.file_path ? (
                    <form
                      action={async () => {
                        "use server";
                        await downloadDocument(doc.file_path!);
                      }}
                    >
                      <button className="inline-flex rounded-lg bg-[#7A0019] px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
                        Download
                      </button>
                    </form>
                  ) : (
                    <span className="text-sm text-slate-500">No file</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Other */}
      <section className="rounded-2xl bg-white shadow-sm border border-[#C0C0C0] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">All other documents</h2>
          <span className="text-sm text-slate-600">{otherDocs.length}</span>
        </div>

        {otherDocs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
            No documents in this category.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {otherDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">{doc.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {doc.category}
                    </span>
                  </div>

                  {doc.description ? (
                    <p className="mt-1 text-sm text-slate-600">{doc.description}</p>
                  ) : null}

                  <p className="mt-1 text-xs text-slate-500">
                    {doc.file_name}
                    {doc.file_size ? ` • ${formatBytes(doc.file_size)}` : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  {doc.file_path ? (
                    <form
                      action={async () => {
                        "use server";
                        await downloadDocument(doc.file_path!);
                      }}
                    >
                      <button className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                        Download
                      </button>
                    </form>
                  ) : (
                    <span className="text-sm text-slate-500">No file</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
