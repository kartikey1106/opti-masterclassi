import { Activity, ShieldCheck, Stethoscope } from "lucide-react";

type HospitalSpecialtiesServicesProps = {
  data: Record<string, unknown>;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function HospitalSpecialtiesServices({
  data,
}: HospitalSpecialtiesServicesProps) {
  const specialtiesHeading = String(
    data.specialtiesHeading ?? data.SpecialtiesHeading ?? "Popular specialties",
  ).trim();
  const specialties = toStringArray(data.specialties ?? data.Specialties);

  const servicesHeading = String(
    data.servicesHeading ?? data.ServicesHeading ?? "Services",
  ).trim();
  const services = toStringArray(data.services ?? data.Services);

  const insuranceHeading = String(
    data.insuranceHeading ?? data.InsuranceHeading ?? "Insurance accepted",
  ).trim();
  const insurance = toStringArray(data.insurance ?? data.Insurance);

  if (
    specialties.length === 0 &&
    services.length === 0 &&
    insurance.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900">
            <Stethoscope size={20} className="text-blue-600" />
            <h3 className="font-bold text-base md:text-lg">
              {specialtiesHeading}
            </h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {specialties.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900">
            <Activity size={20} className="text-teal-600" />
            <h3 className="font-bold text-base md:text-lg">{servicesHeading}</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {services.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Accepted */}
      {insurance.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h3 className="font-bold text-base md:text-lg">
              {insuranceHeading}
            </h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {insurance.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

