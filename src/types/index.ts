import type { LocalizedText } from "@/lib/i18n/config";

/* ── Generic ──────────────────────────────────────────────── */

export type Status = "draft" | "published";

export interface SeoFields {
  seo_title: LocalizedText | null;
  seo_description: LocalizedText | null;
  focus_keyword: LocalizedText | null;
  canonical_url: string | null;
  noindex: boolean;
  og_title: LocalizedText | null;
  og_description: LocalizedText | null;
  og_image: string | null;
  schema_type: string | null;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  sort_order: number;
}

export interface Cta {
  label: LocalizedText;
  url: string;
  variant?: "primary" | "secondary" | "ghost";
}

export interface MediaImage {
  src: string;
  alt: LocalizedText | null;
  title: LocalizedText | null;
  mobile_src?: string | null;
}

/* ── Site settings ────────────────────────────────────────── */

export interface DesignTokens {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light_background: string;
  text: string;
  muted_text: string;
  heading_font: string;
  body_font: string;
  border_radius: number;
  container_width: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface SiteSettings {
  site_name: LocalizedText;
  site_description: LocalizedText;
  tagline: LocalizedText;
  logo: string | null;
  favicon: string | null;
  default_og_image: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: LocalizedText | null;
  working_hours: LocalizedText | null;
  map_embed: string | null;
  ga_measurement_id: string | null;
  gtm_id: string | null;
  meta_pixel_id: string | null;
  google_site_verification: string | null;
  bing_site_verification: string | null;
  page_background?: Record<string, unknown> | null;
  maintenance_mode?: boolean;
  social_links: SocialLink[];
  design_tokens: DesignTokens;
}

/* ── Services ─────────────────────────────────────────────── */

export interface ServiceOffer {
  id?: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface ProcessStep {
  id?: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface ServiceFeature {
  id?: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface Service {
  id: string;
  slug: string;
  name: LocalizedText;
  short_description: LocalizedText;
  content: LocalizedText;
  hero_image: string | null;
  thumbnail: string | null;
  gallery: string[];
  icon: string | null;
  cta: Cta | null;
  features: ServiceFeature[];
  how_it_works: ProcessStep[];
  what_we_offer: ServiceOffer[];
  faq: FaqItem[];
  related_services: string[];
  sort_order: number;
  status: Status;
  seo: SeoFields;
}

/* ── Section builder / pages ──────────────────────────────── */

export type SectionType =
  | "hero"
  | "page_hero"
  | "trust"
  | "image_text"
  | "text_image"
  | "cards"
  | "services_grid"
  | "features"
  | "statistics"
  | "timeline"
  | "process"
  | "faq"
  | "testimonials"
  | "gallery"
  | "cta"
  | "rich_text"
  | "logos";

export interface PageSection {
  id: string;
  type: SectionType;
  title: LocalizedText | null;
  subtitle: LocalizedText | null;
  body: LocalizedText | null;
  image: string | null;
  items: Record<string, unknown>[];
  settings: Record<string, unknown>;
  hidden: boolean;
  sort_order: number;
}

export interface Page {
  id: string;
  slug: string;
  title: LocalizedText;
  menu_title: LocalizedText;
  status: Status;
  sections: PageSection[];
  seo: SeoFields;
}

/* ── Blog ─────────────────────────────────────────────────── */

export interface BlogCategory {
  id: string;
  slug: string;
  name: LocalizedText;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  author: LocalizedText | null;
  published_at: string | null;
  reading_time: number;
  status: Status;
  seo: SeoFields;
}

/* ── Careers ──────────────────────────────────────────────── */

export interface Career {
  id: string;
  slug: string;
  title: LocalizedText;
  department: LocalizedText;
  location: LocalizedText;
  employment_type: LocalizedText;
  description: LocalizedText;
  requirements: LocalizedText;
  responsibilities: LocalizedText;
  benefits: LocalizedText;
  preferred: LocalizedText | null;
  deadline: string | null;
  status: Status;
  /** Demo/sample placeholder flag — true until real vacancies are added. */
  demo?: boolean;
}

/* ── Social proof ─────────────────────────────────────────── */

export interface Testimonial {
  id: string;
  client_name: LocalizedText;
  company: LocalizedText | null;
  position: LocalizedText | null;
  quote: LocalizedText;
  photo: string | null;
  rating: number;
  country: LocalizedText | null;
  service: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface ClientLogo {
  id: string;
  name: string;
  url: string | null;
  logo: string;
  enabled: boolean;
  sort_order: number;
}

export interface Statistic {
  id: string;
  value: string;
  label: LocalizedText;
  suffix: string | null;
  sort_order: number;
  enabled: boolean;
}

export interface WhyUsItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string | null;
  sort_order: number;
  enabled: boolean;
}

/* ── Gallery / media ──────────────────────────────────────── */

export interface GalleryItem {
  id: string;
  src: string;
  alt: LocalizedText | null;
  category: string | null;
  sort_order: number;
}

/* ── Menu ─────────────────────────────────────────────────── */

export interface MenuItem {
  id: string;
  label: LocalizedText;
  url: string | null;
  page: string | null;
  external: boolean;
  children: MenuItem[];
  sort_order: number;
  enabled: boolean;
}

/* ── Leads ────────────────────────────────────────────────── */

export type LeadStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "quoted"
  | "won"
  | "lost"
  | "archived";

export interface Lead {
  id: string;
  type: "quote" | "contact" | "career";
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  payload: Record<string, unknown>;
  status: LeadStatus;
  created_at: string;
  is_read?: boolean | null;
  phone_country?: string | null;
  phone_dial_code?: string | null;
  phone_e164?: string | null;
  service_slug?: string | null;
  cargo_type?: string | null;
  cargo_description?: string | null;
  shipment_size?: string | null;
  urgency?: string | null;
  origin?: string | null;
  destination?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  dimensions?: Record<string, unknown> | null;
  shipping_date?: string | null;
  locale?: string | null;
  source_page?: string | null;
}

/* ── Localized list helpers ───────────────────────────────── */

export type LocalizedList = LocalizedText[];
