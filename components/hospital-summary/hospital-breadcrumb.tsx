import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";

type HospitalBreadcrumbProps = {
  data: Record<string, unknown>;
};

export function HospitalBreadcrumb({ data }: HospitalBreadcrumbProps) {
  const homeLabel = String(
    data.breadcrumbHomeLabel ?? data.BreadcrumbHomeLabel ?? "Home",
  ).trim();
  const homeUrl = String(
    data.breadcrumbHomeUrl ??
      (data.BreadcrumbHomeUrl as any)?.default ??
      "/",
  );
  const hospitalsLabel = String(
    data.breadcrumbHospitalsLabel ?? data.BreadcrumbHospitalsLabel ?? "Hospitals",
  ).trim();
  const hospitalsUrl = String(
    data.breadcrumbHospitalsUrl ??
      (data.BreadcrumbHospitalsUrl as any)?.default ??
      "#",
  );
  const currentLabel = String(
    data.breadcrumbCurrentLabel ??
      data.BreadcrumbCurrentLabel ??
      data.hospitalName ??
      data.HospitalName ??
      "Hospital",
  ).trim();
  const saveLabel = String(
    data.saveLabel ?? data.SaveLabel ?? "Save hospital",
  ).trim();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-xs">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500">
        <Link href={homeUrl} className="transition-colors hover:text-blue-600">
          {homeLabel}
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link href={hospitalsUrl} className="transition-colors hover:text-blue-600">
          {hospitalsLabel}
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-900">{currentLabel}</span>
      </nav>

      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-blue-600"
      >
        <Bookmark size={14} className="text-slate-500" />
        <span>{saveLabel}</span>
      </button>
    </div>
  );
}

