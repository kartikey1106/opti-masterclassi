import { Check, Sparkles } from "lucide-react";

type HospitalServiceTagsSectionProps = {
  data: Record<string, unknown>;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function HospitalServiceTagsSection({
  data,
}: HospitalServiceTagsSectionProps) {
  const heading = String(
    data.heading ?? data.Heading ?? "Hospital services",
  ).trim();
  const description = String(
    data.description ?? data.Description ?? "",
  ).trim();
  const tags = toStringArray(data.tags ?? data.Tags);

  if (tags.length === 0 && !heading && !description) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-blue-50/50 via-white to-slate-50 p-6 shadow-xs md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles size={13} />
            <span>Clinical Capabilities</span>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            {heading}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 md:text-sm"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{tag}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

