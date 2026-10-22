import { GraphClient } from "@optimizely/cms-sdk";
import { setContext, withAppContext } from "@optimizely/cms-sdk/react/server";
import { CMSComponentFactory } from "@/components/cms/component-factory";
import { normalizeHomePageContent } from "@/lib/get-home-page";

type PreviewSearchParams = {
  [key: string]: string | string[] | undefined;
};

function getParam(
  params: PreviewSearchParams,
  name: string,
): string | undefined {
  const value = params[name];
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<PreviewSearchParams>;
}) {
  const params = await searchParams;
  const key = getParam(params, "key");
  const ver = getParam(params, "ver");
  const loc = getParam(params, "loc");
  const ctx = getParam(params, "ctx");
  const previewToken = getParam(params, "preview_token");

  if (!key || !ver || !loc || !ctx || !previewToken) {
    return (
      <main className="medicare-page">
        <div className="medicare-content">
          <p role="alert">
            This Optimizely preview link is missing required parameters. Make
            sure preview tokens are enabled for the CMS website application so
            the preview_token is included.
          </p>
        </div>
      </main>
    );
  }

  const apiKey =
    process.env.OPTIMIZELY_GRAPHQL_API_KEY ?? process.env.OPTIMIZELY_SINGLE_KEY;
  if (!apiKey) {
    throw new Error(
      "OPTIMIZELY_GRAPHQL_API_KEY or OPTIMIZELY_SINGLE_KEY must be configured for CMS preview.",
    );
  }

  const client = new GraphClient(apiKey, {
    graphUrl: process.env.OPTIMIZELY_API_URL,
    query: { cache: false },
  });
  setContext({
    key,
    version: ver,
    locale: loc,
    mode: ctx,
    previewToken,
    type: "DOCHomePage",
  });

  const previewResponse = await client.request(
    `
      query GetHomePagePreview(
        $key: String!
        $version: String!
        $metadataLocale: String!
      ) {
        DOCHomePage(
          where: {
            _metadata: {
              key: { eq: $key }
              version: { eq: $version }
              locale: { eq: $metadataLocale }
            }
          }
        ) {
          item {
            _json
          }
        }
      }
    `,
    { key, version: ver, metadataLocale: loc },
    previewToken,
    false,
  );
  const homepage = isRecord(previewResponse)
    ? previewResponse.DOCHomePage
    : undefined;
  const item = isRecord(homepage) ? homepage.item : undefined;
  const pageJson =
    isRecord(item) && isRecord(item._json) ? item._json : undefined;
  const response = normalizeHomePageContent(pageJson);
  const page = response._Content.items[0] as
    | { DOCMainContentArea?: Array<Record<string, unknown>> }
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
            No homepage components were returned for this preview.
          </div>
        )}
      </div>
    </main>
  );
}

export default withAppContext(PreviewPage);
