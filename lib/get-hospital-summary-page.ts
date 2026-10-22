import { fetchOptimizely } from "./optimizely/fetch";
import { normalizeHomePageContent } from "./get-home-page";

const HOSPITAL_SUMMARY_GUID = "5291f69995b343e99345ab61a55289e2";

export async function getHospitalSummaryPage({
  preview = false,
}: { preview?: boolean } = {}) {
  const query = `
    query GetHospitalSummaryPage($guid: String!) {
      DOCHomePage(
        where: {
          _or: [
            { _metadata: { key: { eq: $guid } } }
            { _metadata: { url: { default: { eq: "/en/hospital-summary/" } } } }
            { _metadata: { url: { default: { eq: "/hospital-summary/" } } } }
            { _metadata: { url: { hierarchical: { eq: "/en/hospital-summary/" } } } }
            { _metadata: { url: { hierarchical: { eq: "/hospital-summary/" } } } }
          ]
        }
      ) {
        item {
          _json
        }
      }
    }
  `;

  const response = await fetchOptimizely<{
    DOCHomePage?: {
      item?: {
        _json?: Record<string, unknown>;
      };
    };
  }>(query, { guid: HOSPITAL_SUMMARY_GUID }, { preview });

  const pageJson = response?.DOCHomePage?.item?._json as
    | Record<string, unknown>
    | undefined;
  return normalizeHomePageContent(pageJson);
}

