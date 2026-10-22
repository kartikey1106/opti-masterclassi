import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone, Star } from "lucide-react";

type HospitalHeaderCardProps = {
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

export function HospitalHeaderCard({ data }: HospitalHeaderCardProps) {
  const hospitalName = String(
    data.hospitalName ?? data.HospitalName ?? "Hospital Name",
  ).trim();
  const tag = String(data.tag ?? data.Tag ?? "").trim();
  const rating =
    typeof data.rating === "number"
      ? data.rating
      : parseFloat(String(data.Rating ?? "4.5")) || 4.5;
  const reviewLabel = String(
    data.reviewLabel ?? data.ReviewLabel ?? "reviews",
  ).trim();
  const status = String(data.status ?? data.Status ?? "").trim();
  const address = String(data.address ?? data.Address ?? "").trim();
  const phoneNumber = String(
    data.phoneNumber ?? data.PhoneNumber ?? "",
  ).trim();
  const primaryActionLabel = String(
    data.primaryActionLabel ?? data.PrimaryActionLabel ?? "Book appointment",
  ).trim();
  const primaryActionUrl = String(
    data.primaryActionUrl ??
      (data.PrimaryActionUrl as any)?.default ??
      "/appointment",
  );
  const secondaryActionLabel = String(
    data.secondaryActionLabel ??
      data.SecondaryActionLabel ??
      "Contact hospital",
  ).trim();
  const secondaryActionUrl = String(
    data.secondaryActionUrl ??
      (data.SecondaryActionUrl as any)?.default ??
      `tel:${phoneNumber.replace(/\s+/g, "")}`,
  );

  const rawImage = data.image ?? data.Image;
  const imageUrl = extractImageUrl(rawImage);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-12 md:gap-8">
        {/* Hospital Photo */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 md:col-span-5 md:aspect-4/3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hospitalName}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 font-bold text-2xl">
              {hospitalName.slice(0, 2).toUpperCase()}
            </div>
          )}
          {tag && (
            <span className="absolute top-3 left-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
              {tag}
            </span>
          )}
        </div>

        {/* Hospital Details */}
        <div className="flex flex-col justify-between md:col-span-7">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {hospitalName}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
              {reviewLabel && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{reviewLabel}</span>
                </>
              )}
              {status && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <Clock size={12} />
                    {status}
                  </span>
                </>
              )}
            </div>

            {/* Address & Phone */}
            <div className="space-y-2 pt-2 text-sm text-slate-600">
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  <span>{address}</span>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="shrink-0 text-slate-400" />
                  <a
                    href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {phoneNumber}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            {primaryActionLabel && (
              <Link
                href={primaryActionUrl}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-hidden"
              >
                {primaryActionLabel}
              </Link>
            )}
            {secondaryActionLabel && (
              <Link
                href={secondaryActionUrl}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
              >
                {secondaryActionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

