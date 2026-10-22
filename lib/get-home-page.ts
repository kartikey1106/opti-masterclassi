import { fetchOptimizely } from "./optimizely/fetch";

const configuredHomePageUrl = process.env.OPTIMIZELY_START_PAGE_URL ?? "home";
const homePageUrl = `/${configuredHomePageUrl.replace(/^\/+|\/+$/g, "")}/`;
const configuredContentGuid = process.env.OPTIMIZELY_CONTENT_GUID?.replace(/-/g, "").toLowerCase();

function toUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;

  if (typeof record.default === "string") return record.default as string;
  if (typeof record.url === "string") return record.url as string;
  if (typeof record.href === "string") return record.href as string;
  if (typeof record.internal === "string") return record.internal as string;
  if (record.url && typeof record.url === "object") {
    const nested = record.url as Record<string, unknown>;
    if (typeof nested.default === "string") return nested.default as string;
    if (typeof nested.internal === "string") return nested.internal as string;
  }

  return "";
}

function toImage(value: unknown): Record<string, string> {
  if (!value) return { url: "", alternativeText: "" };

  if (typeof value === "string") {
    return { url: value, alternativeText: "" };
  }

  const record = value as Record<string, unknown>;
  const imageRef = record.imageLink ?? record;
  const url = toUrl((imageRef as Record<string, unknown>)?.url ?? imageRef);
  const altText =
    typeof record.altText === "string"
      ? record.altText
      : typeof record.alternativeText === "string"
        ? record.alternativeText
        : "";

  return {
    url,
    alternativeText: altText,
  };
}

function normalizeBlock(block: Record<string, unknown>): Record<string, unknown> {
  const __typename = String(block.__typename ?? "");

  switch (__typename) {
    case "DOCHeroBlock": {
      return {
        __typename,
        title: block.Heading ?? block.title ?? "",
        subtitle: block.Subtitle ?? "",
        description: block.Description ?? block.description ?? "",
        primaryCtaLabel: block.PrimaryButtonText ?? block.primaryCtaLabel ?? "Book Appointment",
        primaryCtaUrl: toUrl(block.PrimaryButtonLink ?? block.primaryCtaUrl),
        secondaryCtaLabel: block.SecondaryButtonTextDOC ?? block.secondaryCtaLabel ?? "Find a Doctor",
        secondaryCtaUrl: toUrl(block.SecondaryButtonLink ?? block.secondaryCtaUrl),
        image: toImage(block.HeroImage ?? block.image),
      };
    }
    case "StatisticsBlockDOC": {
      const items = Array.isArray(block.Items) ? block.Items : Array.isArray(block.items) ? block.items : [];
      return {
        __typename,
        title: block.Heading ?? block.title ?? "",
        statistics: items.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            value: record.Value ?? record.value ?? "",
            label: record.Label ?? record.label ?? "",
            icon: record.Icon ?? record.icon ?? "heart",
          };
        }),
      };
    }
    case "SpecialtyListBlockDOC": {
      const items = Array.isArray(block.items) ? block.items : Array.isArray(block.Items) ? block.Items : [];
      return {
        __typename,
        title: block.Heading ?? block.title ?? "Our Specialties",
        items: items.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            name: record.Name ?? record.name ?? "",
            title: record.Title ?? record.title ?? "",
            description: record.Description ?? record.description ?? "",
            image: toImage(record.Image ?? record.image),
          };
        }),
      };
    }
    case "TelehealthBlockDOC": {
      return {
        __typename,
        title: block.Heading ?? block.Title ?? block.title ?? "Care from the comfort of home",
        description: block.Description ?? block.Body ?? block.description ?? "Connect with our specialists via secure video consultation.",
        heading: block.Heading ?? block.Title ?? block.heading ?? "Care from the comfort of home",
        image: toImage(block.Image ?? block.image),
        benefits: Array.isArray(block.Benefits) ? block.Benefits : Array.isArray(block.benefits) ? block.benefits : [],
      };
    }
    case "DoctorListBlockDOC": {
      const items = Array.isArray(block.Doctors) ? block.Doctors : Array.isArray(block.doctors) ? block.doctors : [];
      return {
        __typename,
        title: block.Heading ?? block.title ?? "Meet Our Doctors",
        items: items.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            name: record.Name ?? record.name ?? "",
            role: record.Role ?? record.role ?? "",
            description: record.Description ?? record.description ?? "",
            image: toImage(record.Image ?? record.image),
          };
        }),
      };
    }
    case "TestimonialListBlockDOC": {
      const items = Array.isArray(block.Testimonials) ? block.Testimonials : Array.isArray(block.testimonials) ? block.testimonials : [];
      return {
        __typename,
        title: block.Heading ?? block.title ?? "Testimonials",
        items: items.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            quote: record.Quote ?? record.quote ?? "",
            name: record.PatientName ?? record.name ?? "",
            title: record.Role ?? record.title ?? "",
            image: toImage(record.PatientPhoto ?? record.image),
          };
        }),
      };
    }
    case "InsurancePartnerListBlockDOC": {
      const items = Array.isArray(block.Partners) ? block.Partners : Array.isArray(block.partners) ? block.partners : [];
      return {
        __typename,
        title: block.Heading ?? block.Title ?? block.title ?? "Our Insurance Partners",
        items: items.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            name: record.Name ?? record.name ?? "",
            logo: toImage(record.Logo ?? record.logo),
          };
        }),
      };
    }
    case "EmergencyBannerDOC": {
      return {
        __typename,
        title: block.Heading ?? block.Title ?? block.title ?? "Medical Emergency?",
        description: block.Description ?? block.Body ?? block.description ?? "We are available 24/7",
        phoneNumber: block.PhoneNumber ?? block.phoneNumber ?? "",
        ctaLabel: block.ButtonText ?? block.CTAButtonText ?? block.ctaLabel ?? "Call Now",
        ctaUrl: toUrl(block.ButtonLink ?? block.ctaUrl),
      };
    }
    case "SelectedHospitalSummaryBlockDOC":
    case "HospitalSummaryBlockDOC": {
      const doctors = Array.isArray(block.Doctors) ? block.Doctors : [];
      return {
        ...block,
        __typename,
        breadcrumbHomeLabel: block.BreadcrumbHomeLabel ?? "Home",
        breadcrumbHomeUrl: toUrl(block.BreadcrumbHomeUrl ?? "/"),
        breadcrumbHospitalsLabel: block.BreadcrumbHospitalsLabel ?? "Hospitals",
        breadcrumbHospitalsUrl: toUrl(block.BreadcrumbHospitalsUrl ?? "#"),
        breadcrumbCurrentLabel: block.BreadcrumbCurrentLabel ?? block.HospitalName ?? "",
        saveLabel: block.SaveLabel ?? "Save hospital",
        hospitalName: block.HospitalName ?? "",
        tag: block.Tag ?? "",
        rating: typeof block.Rating === "number" ? block.Rating : parseFloat(String(block.Rating ?? 0)) || 0,
        reviewLabel: block.ReviewLabel ?? "",
        status: block.Status ?? "",
        phoneNumber: block.PhoneNumber ?? "",
        address: block.Address ?? "",
        image: toImage(block.Image ?? block.image),
        primaryActionLabel: block.PrimaryActionLabel ?? "Book appointment",
        primaryActionUrl: toUrl(block.PrimaryActionUrl ?? "/appointment"),
        secondaryActionLabel: block.SecondaryActionLabel ?? "Contact hospital",
        secondaryActionUrl: toUrl(block.SecondaryActionUrl ?? "/contact"),
        overviewHeading: block.OverviewHeading ?? "Overview",
        overview: block.Overview ?? "",
        overviewItems: Array.isArray(block.OverviewItems) ? block.OverviewItems : [],
        specialtiesHeading: block.SpecialtiesHeading ?? "Popular specialties",
        specialties: Array.isArray(block.Specialties) ? block.Specialties : [],
        servicesHeading: block.ServicesHeading ?? "Services",
        services: Array.isArray(block.Services) ? block.Services : [],
        insuranceHeading: block.InsuranceHeading ?? "Insurance accepted",
        insurance: Array.isArray(block.Insurance) ? block.Insurance : [],
        doctorsHeading: block.DoctorsHeading ?? "Doctors",
        doctorsLinkLabel: block.DoctorsLinkLabel ?? "View all doctors",
        doctorsLinkUrl: toUrl(block.DoctorsLinkUrl ?? "/doctors"),
        doctors: doctors.map((doc) => {
          const rec = (doc ?? {}) as Record<string, unknown>;
          return {
            name: rec.Name ?? rec.name ?? "",
            role: rec.Role ?? rec.role ?? "",
            availability: rec.Availability ?? rec.availability ?? "",
            image: toImage(rec.Image ?? rec.image),
          };
        }),
      };
    }
    case "ServiceTagsBlockDOC": {
      return {
        ...block,
        __typename,
        heading: block.Heading ?? block.heading ?? "Hospital services",
        description: block.Description ?? block.description ?? "",
        tags: Array.isArray(block.Tags) ? block.Tags : Array.isArray(block.tags) ? block.tags : [],
      };
    }
    default:
      return block;
  }
}

export function normalizeHomePageContent(
  pageJson?: Record<string, unknown>,
) {
  if (!pageJson) {
    return { _Content: { items: [] } };
  }

  const blocks = Array.isArray(pageJson.DOCMainContentArea)
    ? pageJson.DOCMainContentArea.map((block) =>
        normalizeBlock(block as Record<string, unknown>),
      )
    : [];

  return {
    _Content: {
      items: [
        {
          ...pageJson,
          DOCMainContentArea: blocks,
        },
      ],
    },
  };
}

const DEFAULT_LOCALE = "en";

export async function getHomePage({ preview = false, locale = DEFAULT_LOCALE }: { preview?: boolean; locale?: string } = {}) {
  const isDefaultLocale = locale === DEFAULT_LOCALE;
  const localizedHomePageUrl = isDefaultLocale ? homePageUrl : `/${locale}${homePageUrl}`;
  const query = `
    query GetHomePage($url: String!, $guid: String, $locale: String) {
      DOCHomePage(
        where: {
          _or: [
            { _metadata: { key: { eq: $guid } } }
            {
              _and: [
                { _metadata: { locale: { eq: $locale } } }
                {
                  _or: [
                    { _metadata: { url: { default: { eq: $url } } } }
                    { _metadata: { url: { hierarchical: { eq: $url } } } }
                    { _metadata: { url: { internal: { eq: $url } } } }
                    { _metadata: { url: { graph: { eq: $url } } } }
                  ]
                }
              ]
            }
          ]
        }
      ) {
        item {
          _json
        }
      }
    }`;

  const response = await fetchOptimizely<{
    DOCHomePage?: {
      item?: {
        _json?: Record<string, unknown>;
      };
    };
  }>(query, {
    url: localizedHomePageUrl,
    guid: isDefaultLocale ? (configuredContentGuid ?? "") : "",
    locale,
  }, { preview });

  const pageJson = response?.DOCHomePage?.item?._json as Record<string, unknown> | undefined;
  return normalizeHomePageContent(pageJson);
}