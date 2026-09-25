import { fetchOptimizely } from "./optimizely/fetch";

const configuredHomePageUrl = 'locations';
const homePageUrl = `/${configuredHomePageUrl.replace(/^\/+|\/+$/g, "")}/`;

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

function normalizeLocationItem(item: Record<string, unknown>): Record<string, unknown> {
  const imageValue = item.Image ?? item.image ?? item.Photo ?? item.photo ?? item.Images ?? item.images;
  const images = (Array.isArray(imageValue) ? imageValue : [imageValue])
    .map(toImage)
    .filter((entry) => entry.url);
  const image = images[0];
  const otherDetails = Array.isArray(item.OtherDetails)
    ? item.OtherDetails
    : Array.isArray(item.otherDetails)
      ? item.otherDetails
      : [];

  return {
    name: item.Name ?? item.name ?? item.Title ?? item.title ?? "",
    title: item.Title ?? item.title ?? "",
    address: item.Address ?? item.address ?? item.Location ?? item.location ?? "",
    location: item.Location ?? item.location ?? item.Address ?? item.address ?? "",
    hours: item.Hours ?? item.hours ?? item.OpeningHours ?? item.openingHours ?? "",
    phone: item.PhoneNumber ?? item.phoneNumber ?? item.Phone ?? item.phone ?? "",
    rating: item.Rating ?? item.rating ?? "",
    reviews: item.Reviews ?? item.reviews ?? item.Review ?? item.review ?? "",
    services: Array.isArray(item.Services)
      ? item.Services
      : Array.isArray(item.services)
        ? item.services
        : Array.isArray(item.ServicesOffered)
          ? item.ServicesOffered
          : Array.isArray(item.servicesOffered)
            ? item.servicesOffered
            : [],
    patientsPerDay: item.PatientsPerDay ?? item.patientsPerDay ?? item.Patients ?? item.patients ?? "",
    otherDetails,
    isMainHospital: item.MainHospital ?? item.mainHospital ?? item.IsMainHospital ?? item.isMainHospital ?? false,
    latitude: item.Latitude ?? item.latitude ?? item.lat ?? "",
    longitude: item.Longitude ?? item.longitude ?? item.lng ?? item.lon ?? "",
    images,
    image,
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
    case "DOCLocationsHeroBlock": {
      const infoCards = Array.isArray(block.InfoCards) ? block.InfoCards : Array.isArray(block.infoCards) ? block.infoCards : [];
      return {
        __typename,
        title: block.Title ?? block.title ?? "",
        subtitle: block.Description ?? block.description ?? "",
        stats: infoCards.map((item) => {
          const record = item as Record<string, unknown>;
          return {
            value: record.Title ?? record.title ?? "",
            label: record.Description ?? record.description ?? "",
            icon: toImage(record.Icon ?? record.icon),
          };
        }),
      };
    }
    case "DOCLocationsBlock": {
      const items = Array.isArray(block.Hospitals) ? block.Hospitals : Array.isArray(block.hospitals) ? block.hospitals : [];
      return {
        __typename,
        title: block.Title ?? block.title ?? "",
        subtitle: block.Description ?? block.description ?? "",
        items: items.map((item) => normalizeLocationItem(item as Record<string, unknown>)),
      };
    }
    case "LocationsListBlockDOC":
    case "LocationListBlockDOC":
    case "LocationDirectoryBlockDOC":
    case "LocationsSectionBlockDOC": {
      const items = Array.isArray(block.Items)
        ? block.Items
        : Array.isArray(block.items)
          ? block.items
          : Array.isArray(block.Locations)
            ? block.Locations
            : Array.isArray(block.locations)
              ? block.locations
              : Array.isArray(block.Hospitals)
                ? block.Hospitals
                : Array.isArray(block.hospitals)
                  ? block.hospitals
                  : Array.isArray(block.Clinics)
                    ? block.Clinics
                    : Array.isArray(block.clinics)
                      ? block.clinics
                      : [];

      return {
        __typename,
        title: block.Heading ?? block.Title ?? block.title ?? "",
        subtitle: block.Subtitle ?? block.subTitle ?? block.description ?? "",
        searchPlaceholder: block.SearchPlaceholder ?? block.searchPlaceholder ?? "",
        filterLabel: block.FilterLabel ?? block.filterLabel ?? "",
        stats: Array.isArray(block.Stats)
          ? block.Stats
          : Array.isArray(block.stats)
            ? block.stats
            : [],
        items: items.map((item) => normalizeLocationItem(item as Record<string, unknown>)),
      };
    }
    default:
      return block;
  }
}

export async function getLocationsPage() {
  const query = `
    query GetLocationsPage($url: String!) {
      DOCLocationsPage(
        where: {
          _or: [
            { _metadata: { url: { default: { eq: $url } } } }
            { _metadata: { url: { hierarchical: { eq: $url } } } }
            { _metadata: { url: { internal: { eq: $url } } } }
            { _metadata: { url: { graph: { eq: $url } } } }
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
    DOCLocationsPage?: {
      item?: {
        _json?: Record<string, unknown>;
      };
    };
  }>(query, { url: homePageUrl });

  const pageJson = response?.DOCLocationsPage?.item?._json as Record<string, unknown> | undefined;
  if (!pageJson) {
    return { _Content: { items: [] } };
  }

  const fallbackLocationEntries = Array.isArray(pageJson.Items)
    ? pageJson.Items
    : Array.isArray(pageJson.items)
      ? pageJson.items
      : Array.isArray(pageJson.Locations)
        ? pageJson.Locations
        : Array.isArray(pageJson.locations)
          ? pageJson.locations
          : Array.isArray(pageJson.Hospitals)
            ? pageJson.Hospitals
            : Array.isArray(pageJson.hospitals)
              ? pageJson.hospitals
              : [];

  const blocks = Array.isArray(pageJson.DOCMainContentArea)
    ? pageJson.DOCMainContentArea.map((block) => normalizeBlock(block as Record<string, unknown>))
    : fallbackLocationEntries.length > 0
      ? [
          normalizeBlock({
            __typename: "LocationsListBlockDOC",
            title: pageJson.Title ?? pageJson.title ?? "",
            subtitle: pageJson.Subtitle ?? pageJson.subTitle ?? "",
            items: fallbackLocationEntries,
          }),
        ]
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