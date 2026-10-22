import { HospitalBreadcrumb } from "./hospital-breadcrumb";
import { HospitalHeaderCard } from "./hospital-header-card";
import { HospitalOverview } from "./hospital-overview";
import { HospitalSpecialtiesServices } from "./hospital-specialties-services";
import { HospitalDoctorList } from "./hospital-doctor-list";

type HospitalSummarySectionProps = {
  data: Record<string, unknown>;
};

export function HospitalSummarySection({ data }: HospitalSummarySectionProps) {
  if (!data) return null;

  return (
    <div className="space-y-8 pb-6">
      {/* Top Breadcrumb & Quick Actions */}
      <HospitalBreadcrumb data={data} />

      {/* Hospital Overview Hero Card */}
      <HospitalHeaderCard data={data} />

      {/* Detailed Overview & Key Facts */}
      <HospitalOverview data={data} />

      {/* Specialties, Services & Insurance Grid */}
      <HospitalSpecialtiesServices data={data} />

      {/* Doctors Working At This Hospital */}
      <HospitalDoctorList data={data} />
    </div>
  );
}

