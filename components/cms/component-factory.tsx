import type { ReactNode } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { StatisticsSection } from "@/components/home/statistics-section";
import { SpecialtyListSection } from "@/components/home/specialty-list-section";
import { TelehealthSection } from "@/components/home/telehealth-section";
import { DoctorListSection } from "@/components/home/doctor-list-section";
import { TestimonialListSection } from "@/components/home/testimonial-list-section";
import { InsurancePartnerListSection } from "@/components/home/insurance-partner-list-section";
import { EmergencyBanner } from "@/components/home/emergency-banner";
import {
  HospitalSummarySection,
  HospitalServiceTagsSection,
} from "@/components/hospital-summary";

type CmsBlock = Record<string, unknown> & { __typename?: string };

const componentMap: Record<string, (block: CmsBlock) => ReactNode> = {
  DOCHeroBlock: (block) => <HeroSection data={block} />,
  StatisticsBlockDOC: (block) => <StatisticsSection data={block} />,
  SpecialtyListBlockDOC: (block) => <SpecialtyListSection data={block} />,
  SpecialtiesGridBlock: (block) => <SpecialtyListSection data={block} />,
  TelehealthBlockDOC: (block) => <TelehealthSection data={block} />,
  DoctorListBlockDOC: (block) => <DoctorListSection data={block} />,
  TestimonialListBlockDOC: (block) => <TestimonialListSection data={block} />,
  InsurancePartnerListBlockDOC: (block) => (
    <InsurancePartnerListSection data={block} />
  ),
  EmergencyBannerDOC: (block) => <EmergencyBanner data={block} />,
  SelectedHospitalSummaryBlockDOC: (block) => (
    <HospitalSummarySection data={block} />
  ),
  HospitalSummaryBlockDOC: (block) => (
    <HospitalSummarySection data={block} />
  ),
  ServiceTagsBlockDOC: (block) => (
    <HospitalServiceTagsSection data={block} />
  ),
};

export function CMSComponentFactory({ block }: { block?: CmsBlock }) {
  if (!block || !block.__typename) {
    return null;
  }

  const Renderer = componentMap[block.__typename as string];

  if (!Renderer) {
    return null;
  }

  return <>{Renderer(block)}</>;
}
