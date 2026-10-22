import { fetchOptimizely } from "./optimizely/fetch";

const globalConfigGuid =
  (process.env.OPTIMIZELY_GLOBAL_CONFIG_ID ?? "f43e240148c045789fbff09a170b007b").replace(/-/g, "").toLowerCase();

function toObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  if (typeof record.default === "string") return record.default;
  if (typeof record.url === "string") return record.url;
  if (typeof record.href === "string") return record.href;
  if (typeof record.internal === "string") return record.internal;
  if (typeof record.hierarchical === "string") return record.hierarchical;
  if (typeof record.graph === "string") return record.graph;
  if (record.url && typeof record.url === "object") {
    const nested = record.url as Record<string, unknown>;
    const nestedUrl = toUrl(nested);
    if (nestedUrl) return nestedUrl;
  }
  return "";
}

function toImage(value: unknown): Record<string, string> {
  if (!value) return { url: "", alternativeText: "" };
  if (typeof value === "string") return { url: value, alternativeText: "" };

  const record = toObject(value) ?? {};
  const imageRef = record.imageLink ?? record.image ?? record.Image ?? record.logo ?? record.Logo;
  const nested = toObject(imageRef) ?? record;
  const url = toUrl(nested.url ?? nested.default ?? nested.href ?? nested.internal ?? nested.hierarchical ?? imageRef ?? record);
  const altText =
    typeof record.altText === "string"
      ? record.altText
      : typeof record.alternativeText === "string"
        ? record.alternativeText
        : typeof record.text === "string"
          ? record.text
          : "";

  return { url, alternativeText: altText };
}

function normalizeNavItems(value: unknown): Array<Record<string, unknown>> {
  const items = toArray(value);
  return items
    .map((item) => toObject(item) ?? {})
    .filter((item) => Object.keys(item).length > 0)
    .map((item) => {
      const link = toObject(item.Link ?? item.link ?? item.url ?? item.Url ?? item.href ?? item.Href) ?? {};
      const title = item.LinkText ?? item.linkText ?? item.title ?? item.Text ?? item.text ?? item.label ?? item.Label ?? "";
      const url = toUrl(link.url ?? link.href ?? link.default ?? link.internal ?? item.url ?? item.Url ?? item.href ?? item.Href ?? item.target);

      return {
        ...item,
        title,
        url,
      };
    });
}

function normalizeHeaderSettings(value: Record<string, unknown> = {}): Record<string, unknown> {
  const loginLink = toObject(value.LoginLink ?? value.loginLink ?? value.loginUrl ?? value.LoginUrl) ?? {};
  const appointmentLink = toObject(value.AppointmentLink ?? value.appointmentLink ?? value.ctaUrl ?? value.CTAUrl) ?? {};
  const navItems = normalizeNavItems(value.NavigationItems ?? value.navigationItems ?? value.NavItems ?? value.navItems ?? value.links ?? []);

  return {
    logo: toImage(value.Logo ?? value.logo ?? value.SiteLogo ?? value.siteLogo ?? value.headerLogo),
    navItems,
    loginText: value.LoginText ?? value.loginText ?? value.LoginLabel ?? value.loginLabel ?? "Login",
    loginUrl: toUrl(loginLink.url ?? loginLink.href ?? loginLink.default ?? loginLink.internal ?? value.LoginUrl ?? value.loginUrl),
    ctaText: value.AppointmentText ?? value.appointmentText ?? value.CTAText ?? value.ctaText ?? "Book Appointment",
    ctaUrl: toUrl(appointmentLink.url ?? appointmentLink.href ?? appointmentLink.default ?? appointmentLink.internal ?? value.AppointmentUrl ?? value.appointmentUrl),
    siteName: value.SiteName ?? value.siteName ?? value.companyName ?? value.name ?? "DoctorCare",
  };
}

function normalizeFooterSettings(value: Record<string, unknown> = {}): Record<string, unknown> {
  const footerSettings = toObject(value.FooterSettings ?? value.footerSettings ?? value) ?? {};
  const socialLinks = toArray(footerSettings.SocialLinks ?? footerSettings.socialLinks ?? footerSettings.SocialLink ?? footerSettings.socialLink);

  return {
    logo: toImage(footerSettings.Logo ?? footerSettings.logo ?? value.Logo ?? value.logo),
    description:
      footerSettings.Description ??
      footerSettings.description ??
      footerSettings.footerText ??
      footerSettings.FooterText ??
      value.description ??
      "Patient-first healthcare solutions for every stage of life.",
    columns: toArray(footerSettings.columns ?? footerSettings.Columns ?? footerSettings.footerColumns ?? footerSettings.FooterColumns),
    socialLinks: socialLinks.map((item) => {
      const record = toObject(item) ?? {};
      const logo = toObject(record.logo ?? record.Logo) ?? {};
      const imageSource = Object.keys(logo).length > 0 ? logo : record.Image ?? record.image ?? record.Icon ?? record.icon;
      return {
        label: record.Platform ?? record.platform ?? record.label ?? record.Label ?? "Social",
        url: toUrl(record.url ?? record.Url ?? record.href ?? record.Href ?? record.link ?? record.Link),
        image: toImage(imageSource),
          imageAlt: logo.altText ?? logo.AltText ?? logo.Description ?? logo.description ?? "",
      };
    }),
    copyright: footerSettings.Copyright ?? footerSettings.copyright ?? footerSettings.CopyrightText ?? footerSettings.copyrightText ?? "© 2026 DoctorCare. All rights reserved.",
  };
}

function normalizeSiteSettings(value: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    siteName: value.SiteName ?? value.siteName ?? value.companyName ?? value.name ?? "DoctorCare",
    tagline: value.Tagline ?? value.tagline ?? value.description ?? "",
    emergencyPhone: value.EmergencyPhone ?? value.emergencyPhone ?? value.phone ?? "",
    emergencyText: value.EmergencyText ?? value.emergencyText ?? value.emergencyMessage ?? "",
    logo: toImage(value.Logo ?? value.logo ?? value.SiteLogo ?? value.siteLogo),
  };
}

function getHeaderPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sources = [
    payload.HeaderSettingsDOC,
    payload.HeaderSettings,
    payload.Header,
    payload.GlobalHeaderSettings,
    payload.GlobalSettings,
    payload.LayoutSettings,
    payload,
  ];

  for (const source of sources) {
    const item = Array.isArray(source) ? source[0] : source;
    if (item && typeof item === "object") {
      const object = item as Record<string, unknown>;
      if (object.LoginText || object.LoginLink || object.AppointmentText || object.AppointmentLink || object.NavigationItems || object.Logo) {
        return object;
      }
    }
  }

  return {};
}

function getFooterPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sources = [
    payload.FooterSettings,
    payload.footerSettings,
    payload.Footer,
    payload.GlobalFooterSettings,
    payload,
  ];

  for (const source of sources) {
    const item = Array.isArray(source) ? source[0] : source;
    if (item && typeof item === "object") {
      const object = item as Record<string, unknown>;
      if (object.Description || object.Description || object.Logo || object.SocialLinks || object.Copyright) {
        return object;
      }
    }
  }

  return {};
}

export async function getGlobalConfiguration({ preview = false }: { preview?: boolean } = {}) {
  const query = `
    query GetGlobalConfiguration($guid: String!) {
      HeaderSettingsDOC(where: { _metadata: { key: { eq: $guid } } }) {
        item {
          __typename
          _json
        }
      }
      GlobalSettings(where: { _metadata: { key: { eq: $guid } } }) {
        item {
          __typename
          _json
        }
      }
      LayoutSettings(where: { _metadata: { key: { eq: $guid } } }) {
        item {
          __typename
          _json
        }
      }
    }
  `;

  const result = await fetchOptimizely<{
    HeaderSettingsDOC?: { item?: { _json?: Record<string, unknown> } | null };
    GlobalSettings?: { item?: { _json?: Record<string, unknown> } | null };
    LayoutSettings?: { item?: { _json?: Record<string, unknown> } | null };
  }>(query, { guid: globalConfigGuid }, { preview });

  const headerJson = result.HeaderSettingsDOC?.item?._json ?? {};
  const globalSettingsJson = result.GlobalSettings?.item?._json ?? {};
  const layoutSettingsJson = result.LayoutSettings?.item?._json ?? {};

  const headerSource = getHeaderPayload({ ...layoutSettingsJson, ...globalSettingsJson, HeaderSettingsDOC: headerJson });
  const footerSource = getFooterPayload({ ...layoutSettingsJson, ...globalSettingsJson, FooterSettings: headerJson.FooterSettings, HeaderSettingsDOC: headerJson });
  const siteSource = {
    ...layoutSettingsJson,
    ...globalSettingsJson,
    ...headerJson,
    SiteName: headerJson.SiteName ?? headerJson.siteName ?? "DoctorCare",
  };

  const headerSettings = normalizeHeaderSettings({ ...headerJson, ...layoutSettingsJson, ...globalSettingsJson, ...headerSource });
  const footerSettings = normalizeFooterSettings({ ...headerJson, ...layoutSettingsJson, ...globalSettingsJson, ...footerSource });
  const siteSettings = normalizeSiteSettings({ ...headerJson, ...layoutSettingsJson, ...globalSettingsJson, ...siteSource });

  return {
    _Content: {
      items: [
        {
          ...layoutSettingsJson,
          ...globalSettingsJson,
          ...headerJson,
          GlobalHeaderSettings: [headerSettings],
          GlobalFooterSettings: [footerSettings],
          GlobalSiteSettings: [siteSettings],
          HeaderSettings: [headerSettings],
          FooterSettings: [footerSettings],
          SiteSettings: [siteSettings],
          header: headerSettings,
          footer: footerSettings,
          site: siteSettings,
        },
      ],
    },
  };
}
