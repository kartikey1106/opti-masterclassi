import { CheckCircle2 } from "lucide-react";

type HospitalOverviewProps = {
  data: Record<string, unknown>;
};

export function HospitalOverview({ data }: HospitalOverviewProps) {
  const heading = String(
    data.overviewHeading ?? data.OverviewHeading ?? "Overview",
  ).trim();
  const overviewText = String(
    data.overview ?? data.Overview ?? "",
  ).trim();
  const rawItems = data.overviewItems ?? data.OverviewItems;
  const items: string[] = Array.isArray(rawItems)
    ? rawItems.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!overviewText && items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:p-8">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
        {heading}
      </h2>

      {overviewText && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          {overviewText}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 md:text-sm"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

