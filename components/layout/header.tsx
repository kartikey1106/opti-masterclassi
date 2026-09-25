import Image from "next/image";
import Link from "next/link";

type CmsSettings = {
  _Content?: {
    items?: Array<Record<string, unknown>>;
  };
};

function resolveImageUrl(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  const record = value as Record<string, unknown>;
  if (typeof record.url === "string") return record.url;
  if (typeof record.default === "string") return record.default;
  if (typeof record.href === "string") return record.href;
  if (typeof record.src === "string") return record.src;
  if (typeof record.internal === "string") return record.internal;

  if (record.image && typeof record.image === "object") {
    return resolveImageUrl(record.image);
  }

  return "";
}

export function Header({ settings }: { settings?: CmsSettings }) {
  const config = settings?._Content?.items?.[0] as Record<string, unknown> | undefined;
  const header = ((config?.GlobalHeaderSettings as Array<Record<string, unknown>> | undefined) ?? [])[0] as Record<string, unknown> | undefined;
  const site = ((config?.GlobalSiteSettings as Array<Record<string, unknown>> | undefined) ?? [])[0] as Record<string, unknown> | undefined;
  const navItems = (header?.navItems as Array<Record<string, unknown>> | undefined) ?? [
    { title: "Home", url: "/" },
    { title: "Find Doctors", url: "/doctors" },
    { title: "Specialties", url: "/specialties" },
    { title: "Locations", url: "/locations" },
    { title: "Telehealth", url: "/telehealth" },
    { title: "Health Library", url: "/health-library" },
    { title: "About Us", url: "/about" },
  ];
  const siteName = String(site?.siteName ?? header?.siteName ?? "DoctorCare");
  const logo = (header?.logo as Record<string, string> | undefined) ?? (site?.logo as Record<string, string> | undefined) ?? {
    url: "",
    alternativeText: "",
  };
  const logoUrl = resolveImageUrl(logo ?? header?.logo ?? site?.logo ?? {});

  return (
    <header className="medicare-header">
      <div className="medicare-nav">
        <Link href="/" className="medicare-brand">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={String(logo?.alternativeText ?? siteName ?? "Brand logo")}
              width={220}
              height={44}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <span className="medicare-brand-mark">✚</span>
          )}
          {!logoUrl ? (
            <span>
              <strong>{siteName}</strong>
              <small>{String(site?.tagline ?? "Your Health, Our Priority")}</small>
            </span>
          ) : null}
        </Link>

        <nav className="medicare-links">
          {navItems.map((item, index) => (
            <Link key={`${item?.title ?? "nav"}-${index}`} href={String(item?.url ?? "/")}>
              {String(item?.title ?? "Menu")}
            </Link>
          ))}
        </nav>

        <div className="medicare-actions">
          <div className="medicare-support">
            <span className="medicare-support-icon" aria-hidden="true">☎</span>
            <span>
              <strong>{String(header?.supportPhone ?? "1800 123 4567")}</strong>
              <small>{String(header?.supportLabel ?? "24/7 Support")}</small>
            </span>
          </div>
          <Link href={String(header?.ctaUrl ?? "/appointment")} className="medicare-header-cta">
            {String(header?.ctaText ?? "Book Appointment")}
          </Link>
        </div>
      </div>
    </header>
  );
}
