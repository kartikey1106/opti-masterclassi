import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";

type HospitalDoctorListProps = {
  data: Record<string, unknown>;
};

function extractImageUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const obj = value as Record<string, unknown>;
  if (typeof obj.url === "string") return obj.url;
  if (obj.url && typeof obj.url === "object") {
    const nested = obj.url as Record<string, unknown>;
    if (typeof nested.default === "string") return nested.default;
  }
  if (typeof obj.default === "string") return obj.default;
  return "";
}

export function HospitalDoctorList({ data }: HospitalDoctorListProps) {
  const doctorsHeading = String(
    data.doctorsHeading ?? data.DoctorsHeading ?? "Doctors",
  ).trim();
  const doctorsLinkLabel = String(
    data.doctorsLinkLabel ?? data.DoctorsLinkLabel ?? "View all doctors",
  ).trim();
  const doctorsLinkUrl = String(
    data.doctorsLinkUrl ??
      (data.DoctorsLinkUrl as any)?.default ??
      "/doctors",
  );

  const rawDoctors = data.doctors ?? data.Doctors;
  const doctors = Array.isArray(rawDoctors) ? rawDoctors : [];

  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          {doctorsHeading}
        </h2>
        {doctorsLinkLabel && (
          <Link
            href={doctorsLinkUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 md:text-sm"
          >
            {doctorsLinkLabel}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {doctors.map((doctorItem, idx) => {
          const doc = (doctorItem ?? {}) as Record<string, unknown>;
          const name = String(doc.name ?? doc.Name ?? "Doctor").trim();
          const role = String(doc.role ?? doc.Role ?? "Specialist").trim();
          const availability = String(
            doc.availability ?? doc.Availability ?? "",
          ).trim();
          const imageUrl = extractImageUrl(doc.image ?? doc.Image);

          return (
            <article
              key={idx}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-sm"
            >
              <div>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                      <User size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  {availability && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                      {availability}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    {name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">{role}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-blue-600 hover:text-white"
                >
                  <Calendar size={13} />
                  <span>Book Consultation</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

