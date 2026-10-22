import { timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const configuredSecret = process.env.OPTIMIZELY_PREVIEW_SECRET;
  if (!configuredSecret) {
    return new Response("Preview is not configured.", { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const suppliedSecret = requestUrl.searchParams.get("secret") ?? "";
  const configuredSecretBytes = Buffer.from(configuredSecret);
  const suppliedSecretBytes = Buffer.from(suppliedSecret);

  if (
    configuredSecretBytes.length !== suppliedSecretBytes.length ||
    !timingSafeEqual(configuredSecretBytes, suppliedSecretBytes)
  ) {
    return new Response("Invalid preview secret.", { status: 401 });
  }

  const slug = requestUrl.searchParams.get("slug") ?? "/";
  if (!slug.startsWith("/") || slug.startsWith("//") || slug.includes("\\")) {
    return new Response("Invalid preview path.", { status: 400 });
  }

  const destination = new URL(slug, requestUrl);
  if (destination.origin !== requestUrl.origin) {
    return new Response("Invalid preview path.", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(destination);
}
