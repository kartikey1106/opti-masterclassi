"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, ChevronDown, Clock3, Filter, MapPin, Phone, Search, Star } from "lucide-react";

type LocationItem = Record<string, unknown>;

function getString(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getCoordinate(value: unknown): number | null {
  const coordinate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function isMainHospital(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function getCity(item: LocationItem): string {
  const explicitCity = getString(item.city ?? item.City);
  if (explicitCity) return explicitCity;

  const address = getString(item.address ?? item.Address ?? item.location ?? item.Location);
  return address.split(",")[1]?.trim() ?? "";
}

function getImageUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  if (typeof record.url === "string") return record.url;
  if (typeof record.default === "string") return record.default;
  if (typeof record.href === "string") return record.href;
  if (typeof record.internal === "string") return record.internal;
  if (record.url && typeof record.url === "object") return getImageUrl(record.url);
  if (record.imageLink && typeof record.imageLink === "object") return getImageUrl(record.imageLink);
  if (record.image && typeof record.image === "object") return getImageUrl(record.image);

  return "";
}

type ServiceDetail = {
  name: string;
  image: string;
};

type OtherDetail = {
  title: string;
  description: string;
  image: string;
};

function getServices(value: unknown): ServiceDetail[] {
  if (!Array.isArray(value)) return [];

  const services = value
    .map((service) => {
      if (typeof service === "string") return { name: service, image: "" };
      if (service && typeof service === "object") {
        const record = service as Record<string, unknown>;
        return {
          name: getString(record.name ?? record.Name ?? record.title ?? record.Title ?? record.serviceName ?? record.ServiceName),
          image: getImageUrl(record.image ?? record.Image ?? record.iconImage ?? record.IconImage ?? record.Icon),
        };
      }
      return { name: "", image: "" };
    })
    .filter((service) => Boolean(service.name));

  return services.filter(
    (service, index) => services.findIndex((candidate) => candidate.name.toLowerCase() === service.name.toLowerCase()) === index,
  );
}

function getOtherDetails(value: unknown): OtherDetail[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((detail) => {
      if (!detail || typeof detail !== "object") {
        return { title: "", description: "", image: "" };
      }

      const record = detail as Record<string, unknown>;
      return {
        title: getString(record.title ?? record.Title),
        description: getString(record.description ?? record.Description),
        image: getImageUrl(record.icon ?? record.Icon ?? record.image ?? record.Image),
      };
    })
    .filter((detail) => detail.title || detail.description || detail.image);
}

export function LocationsSection({
  data,
  showHeader = true,
}: {
  data: Record<string, unknown>;
  showHeader?: boolean;
}) {
  const title = getString(data?.title);
  const subtitle = getString(data?.subtitle);
  const items = Array.isArray(data?.items)
    ? (data.items as Array<LocationItem>)
    : Array.isArray(data?.locations)
      ? (data.locations as Array<LocationItem>)
      : Array.isArray(data?.hospitals)
        ? (data.hospitals as Array<LocationItem>)
        : Array.isArray(data?.clinics)
          ? (data.clinics as Array<LocationItem>)
          : [];

    const mainHospitalIndex = items.findIndex((item) => isMainHospital(item.isMainHospital ?? item.MainHospital ?? item.mainHospital));
    const [selectedIndex, setSelectedIndex] = useState(mainHospitalIndex >= 0 ? mainHospitalIndex : 0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCity, setSelectedCity] = useState("all");
    const [activeFilter, setActiveFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const cityOptions = Array.from(new Set(items.map(getCity))).filter(Boolean);
    const filteredItems = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const haystack = `${getString(item.name ?? item.Name)} ${getString(item.address ?? item.Address ?? item.location ?? item.Location)}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.trim().toLowerCase());
          const matchesCity = selectedCity === "all" || getCity(item) === selectedCity;
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "main" && isMainHospital(item.isMainHospital ?? item.MainHospital ?? item.mainHospital)) ||
          (activeFilter === "open" && getString(item.hours ?? item.Hours).toLowerCase().includes("open")) ||
          (activeFilter === "rated" && Number(item.rating ?? item.Rating) >= 4.5);

        return matchesSearch && matchesCity && matchesFilter;
      });
    const selectedEntry = filteredItems.find(({ index }) => index === selectedIndex) ?? filteredItems[0];
    const selectedItem = selectedEntry?.item;
    const selectedImages = Array.isArray(selectedItem?.images) && selectedItem.images.length > 0
      ? selectedItem.images as Array<Record<string, unknown>>
      : selectedItem?.image ? [selectedItem.image] : [];
    const selectedServices = getServices(selectedItem?.services);
    const selectedOtherDetails = getOtherDetails(selectedItem?.otherDetails ?? selectedItem?.OtherDetails);

  return (
    <section className="medicare-locations-page">
      {showHeader ? (
        <div className="medicare-locations-standalone-header">
          <div className="medicare-breadcrumb">
            <Link href="/">Home</Link>
            <span className="medicare-breadcrumb-separator">&gt;</span>
            <span>Locations</span>
          </div>
          <div className="medicare-locations-header">
            <h1>{title}</h1>
          </div>
          <p className="medicare-locations-subtitle">{subtitle}</p>
        </div>
      ) : null}

      <div className="medicare-locations-shell">
        <aside className="medicare-locations-list-panel">
          <div className="medicare-locations-toolbar">
            <div className="medicare-location-search">
              <Search size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={getString(data?.searchPlaceholder)}
                aria-label="Search hospitals"
              />
            </div>
            <label className="medicare-location-region">
              <MapPin size={15} />
              <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} aria-label="Filter by city">
                <option value="all">{getString(data?.locationLabel) || "All locations"}</option>
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <div className="medicare-location-filter-wrap">
            <button type="button" className="medicare-location-filter" onClick={() => setIsFilterOpen((open) => !open)} aria-expanded={isFilterOpen}>
              <Filter size={16} />
              <span>{getString(data?.filterLabel) || "Filter"}</span>
            </button>
            {isFilterOpen ? (
              <div className="medicare-location-filter-menu" role="menu">
                {[
                  ["all", "All locations"],
                  ["main", "Main hospital"],
                  ["open", "Open now"],
                  ["rated", "Rating 4.5+"],
                ].map(([value, label]) => (
                  <button key={value} type="button" className={activeFilter === value ? "selected" : ""} onClick={() => { setActiveFilter(value); setIsFilterOpen(false); }} role="menuitem">
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
            </div>
          </div>

          <div className="medicare-location-list">
            {filteredItems.length > 0 ? (
              filteredItems.map(({ item, index }) => {
                const imageUrl = getImageUrl(item?.image ?? item?.photo ?? item?.Image ?? item?.Photo);
                const isActive = index === selectedIndex;
                const isMain = isMainHospital(item.isMainHospital ?? item.MainHospital ?? item.mainHospital);
                const rating = getString(item?.rating);
                const reviews = getString(item?.reviews);

                return (
                  <article
                    key={`${getString(item?.name)}-${index}`}
                    className={`medicare-location-card ${isActive ? "active" : ""} ${isMain ? "main" : ""}`}
                    onClick={() => setSelectedIndex(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedIndex(index);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {imageUrl ? (
                      <div className="medicare-location-thumb">
                        <Image src={imageUrl} alt={getString(item?.name)} width={140} height={110} className="medicare-location-image" />
                      </div>
                    ) : (
                      <div className="medicare-location-thumb medicare-location-thumb-placeholder" aria-hidden="true" />
                    )}

                    <div className="medicare-location-content">
                      <div className="medicare-location-title-row">
                        {isMain ? <span className="medicare-location-badge">Main Hospital</span> : null}
                        <h3>{getString(item?.name)}</h3>
                        <div className="medicare-location-rating">
                          <Star size={14} fill="currentColor" />
                          <span>
                            {rating} <small>({reviews})</small>
                          </span>
                        </div>
                      </div>

                      <div className="medicare-location-meta">
                        <MapPin size={14} />
                        <span>{getString(item?.address ?? item?.location)}</span>
                      </div>

                      <div className="medicare-location-meta-row">
                        <div className="medicare-location-meta">
                          <Clock3 size={14} />
                          <span>{getString(item?.hours)}</span>
                        </div>
                        <div className="medicare-location-meta">
                          <Phone size={14} />
                          <span>{getString(item?.phone)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="medicare-location-arrow">
                      <ArrowRight size={18} />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="medicare-location-empty">No locations available right now.</div>
            )}
          </div>

          <button type="button" className="medicare-location-view-all" onClick={() => { setSearchTerm(""); setSelectedCity("all"); setActiveFilter("all"); }}>
            <span>View All Locations</span>
          </button>
        </aside>

        <div className="medicare-locations-map-panel">
          <div className="medicare-map-surface">
            {selectedItem && getCoordinate(selectedItem.latitude ?? selectedItem.Latitude) !== null && getCoordinate(selectedItem.longitude ?? selectedItem.Longitude) !== null ? (
              <iframe
                className="medicare-google-map"
                title={`Map showing ${getString(selectedItem?.name)}`}
                src={`https://www.google.com/maps?q=${getCoordinate(selectedItem.latitude ?? selectedItem.Latitude)},${getCoordinate(selectedItem.longitude ?? selectedItem.Longitude)}&z=14&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="medicare-map-empty">Map coordinates are not available for this hospital.</div>
            )}
          </div>

            <div className="medicare-map-feature-card">
              <div className="medicare-map-feature-gallery">
                <div className="medicare-map-feature-image-wrap">
                  {selectedImages.length > 0 ? (
                    <Image
                      src={getImageUrl(selectedImages[0])}
                      alt={getString(selectedItem?.name)}
                      width={240}
                      height={140}
                      className="medicare-map-feature-image"
                    />
                  ) : null}
                  {selectedImages.length > 1 ? <div className="medicare-location-image-count">+{selectedImages.length - 1}</div> : null}
                </div>
                {selectedImages.length > 1 ? (
                  <div className="medicare-location-image-gallery">
                    {selectedImages.slice(1).map((image, index) => (
                      <Image key={`${getImageUrl(image)}-${index}`} src={getImageUrl(image)} alt={`${getString(selectedItem?.name)} image ${index + 2}`} width={72} height={52} />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="medicare-map-feature-copy">
                {isMainHospital(selectedItem?.isMainHospital ?? selectedItem?.MainHospital ?? selectedItem?.mainHospital) ? (
                  <div className="medicare-map-flag">Main Hospital</div>
                ) : null}
                <h3>{getString(selectedItem?.name)}</h3>
                <div className="medicare-map-detail-line">
                  <MapPin size={13} />
                  <span>{getString(selectedItem?.address)}</span>
                </div>
                <div className="medicare-map-rating-line">
                  <span className="medicare-map-star"><Star size={12} fill="currentColor" /></span>
                  <span>{getString(selectedItem?.rating)}</span>
                  <small>{getString(selectedItem?.reviews) ? `(${getString(selectedItem?.reviews)} Reviews)` : null}</small>
                  {getString(selectedItem?.patientsPerDay) ? <span className="medicare-map-patients-inline"><Activity size={13} /> <strong>{getString(selectedItem?.patientsPerDay)}</strong> Patients served daily</span> : null}
                </div>

                {selectedOtherDetails.length > 0 ? (
                  <div className="medicare-location-details-grid">
                    {selectedOtherDetails.map((detail, index) => (
                      <div className="medicare-location-detail-card" key={`${detail.title}-${index}`}>
                        {detail.image ? <Image src={detail.image} alt="" width={24} height={24} className="medicare-location-detail-icon" /> : null}
                        <strong>{detail.title}</strong>
                        <span>{detail.description}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedServices.length > 0 ? (
                  <div className="medicare-services-area">
                    <h4>Services Offered</h4>
                    <div className="medicare-services-row">
                      {selectedServices.map((service, index) => {
                        return (
                          <span key={`${service.name}-${index}`} className="medicare-service-pill">
                            {service.image ? <Image src={service.image} alt="" width={14} height={14} /> : service.icon ? <ServiceIcon size={12} /> : null}
                            {service.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="medicare-map-actions">
                  <button type="button" className="medicare-map-primary-button">Book Appointment</button>
                  <button type="button" className="medicare-map-secondary-button">View Details</button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
