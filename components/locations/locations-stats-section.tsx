import Image from "next/image";
import Link from "next/link";

type LocationStat = Record<string, unknown>;

function getString(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getImageUrl(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  if (typeof record.url === "string") return record.url;
  if (typeof record.default === "string") return record.default;
  if (record.imageLink && typeof record.imageLink === "object") return getImageUrl(record.imageLink);
  return "";
}

export function LocationsStatsSection({ data }: { data: Record<string, unknown> }) {
  const title = getString(data?.title);
  const subtitle = getString(data?.subtitle);
  const stats = Array.isArray(data?.stats)
    ? (data.stats as Array<LocationStat>)
    : Array.isArray(data?.items)
      ? (data.items as Array<LocationStat>)
      : [];

  return (
    <section className="medicare-locations-hero" aria-labelledby="locations-page-title">
      <div className="medicare-breadcrumb">
        <Link href="/">Home</Link>
        <span className="medicare-breadcrumb-separator">&gt;</span>
        <span>Locations</span>
      </div>

      <div className="medicare-locations-hero-row">
        <div className="medicare-locations-hero-copy">
          <h1 id="locations-page-title">{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="medicare-locations-header-stats" aria-label="Location stats">
          <div className="medicare-locations-stat-row">
            {stats.map((item, index) => (
              <div key={`${getString(item?.label)}-${index}`} className="medicare-location-stat-card">
                {getImageUrl(item?.icon) ? <Image src={getImageUrl(item.icon)} alt="" width={24} height={24} className="medicare-location-stat-icon" /> : null}
                <div className="medicare-location-stat-value">{getString(item?.value)}</div>
                <div className="medicare-location-stat-label">{getString(item?.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
