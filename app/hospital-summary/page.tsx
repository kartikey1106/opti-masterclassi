import { draftMode } from "next/headers";
import { CMSComponentFactory } from "@/components/cms/component-factory";
import { getHospitalSummaryPage } from "@/lib/get-hospital-summary-page";

export default async function HospitalSummaryRoute() {
  const { isEnabled } = await draftMode();
  const response = await getHospitalSummaryPage({ preview: isEnabled });
  const page = response?._Content?.items?.[0] as
    | {
        DOCMainContentArea?: Array<Record<string, unknown>>;
      }
    | undefined;

  const blocks = page?.DOCMainContentArea ?? [];

  return (
    <main className="medicare-page">
      <div className="medicare-content">
        {blocks.length > 0 ? (
          blocks.map((block, index) => (
            <CMSComponentFactory
              key={`${block?.__typename ?? "block"}-${index}`}
              block={block}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            No hospital summary components found.
          </div>
        )}
      </div>
    </main>
  );
}

