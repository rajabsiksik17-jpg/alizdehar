import type { SiteSettings, MenuItem, SocialLink } from "@/types";
import { localize } from "@/lib/i18n/config";

/*
 * Default site settings + navigation.
 * These values are SEED data — once Supabase is connected, the CMS
 * `settings` table becomes the source of truth.
 *
 * NOTE: phone / email / address / social URLs are intentionally empty.
 * They are NOT present in the source document. Fill them from the admin
 * dashboard (Settings → General) — the UI hides empty values gracefully.
 */

export const seedSettings: SiteSettings = {
  site_name: localize("Al-Izdehar Logistics", "الإزدهار للوجستيات"),
  site_description: localize(
    "Integrated shipping and logistics solutions connecting your business to global markets through air, sea and land freight, with customs clearance expertise since 1982.",
    "حلول شحن ولوجستيات متكاملة تربط أعمالك بالأسواق العالمية عبر الشحن الجوي والبحري والبري، مع خبرة في التخليص الجمركي منذ عام 1982.",
  ),
  tagline: localize(
    "Transport with Confidence. Arrive Successfully.",
    "انقل بثقة… صِل بنجاح",
  ),
  logo: null,
  favicon: null,
  default_og_image: null,
  phone: null,
  email: null,
  whatsapp: null,
  address: null,
  working_hours: null,
  map_embed: null,
  ga_measurement_id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null,
  gtm_id: process.env.NEXT_PUBLIC_GTM_ID || null,
  meta_pixel_id: null,
  google_site_verification: null,
  bing_site_verification: null,
  page_background: null,
  social_links: [
    { id: "social-whatsapp", platform: "whatsapp", label: "WhatsApp", url: "", icon: "whatsapp", enabled: false, sort_order: 1 },
    { id: "social-facebook", platform: "facebook", label: "Facebook", url: "", icon: "facebook", enabled: false, sort_order: 2 },
    { id: "social-instagram", platform: "instagram", label: "Instagram", url: "", icon: "instagram", enabled: false, sort_order: 3 },
    { id: "social-linkedin", platform: "linkedin", label: "LinkedIn", url: "", icon: "linkedin", enabled: false, sort_order: 4 },
    { id: "social-x", platform: "x", label: "X", url: "", icon: "x", enabled: false, sort_order: 5 },
  ] as SocialLink[],
  design_tokens: {
    primary: "#0f2a48",
    secondary: "#255c94",
    accent: "#d98c1f",
    dark: "#081c33",
    light_background: "#f5f7fa",
    text: "#0b1d33",
    muted_text: "#55647a",
    heading_font: "Cairo",
    body_font: "Cairo",
    border_radius: 16,
    container_width: 1216,
  },
};

export const seedMenu: MenuItem[] = [
  {
    id: "menu-home",
    label: localize("Home", "الرئيسية"),
    url: "/",
    page: null,
    external: false,
    enabled: true,
    sort_order: 1,
    children: [],
  },
  {
    id: "menu-about",
    label: localize("About Us", "من نحن"),
    url: "/about",
    page: null,
    external: false,
    enabled: true,
    sort_order: 2,
    children: [],
  },
  {
    id: "menu-services",
    label: localize("Services & Solutions", "الخدمات والحلول"),
    url: "/services",
    page: null,
    external: false,
    enabled: true,
    sort_order: 3,
    children: [
      {
        id: "menu-sea",
        label: localize("Sea Freight", "الشحن البحري"),
        url: "/services/sea-freight",
        page: null,
        external: false,
        enabled: true,
        sort_order: 1,
        children: [],
      },
      {
        id: "menu-land",
        label: localize("Land Freight", "الشحن البري"),
        url: "/services/land-freight",
        page: null,
        external: false,
        enabled: true,
        sort_order: 2,
        children: [],
      },
      {
        id: "menu-air",
        label: localize("Air Freight", "الشحن الجوي"),
        url: "/services/air-freight",
        page: null,
        external: false,
        enabled: true,
        sort_order: 3,
        children: [],
      },
      {
        id: "menu-customs",
        label: localize("Customs Clearance", "التخليص الجمركي"),
        url: "/services/customs-clearance",
        page: null,
        external: false,
        enabled: true,
        sort_order: 4,
        children: [],
      },
      {
        id: "menu-integrated",
        label: localize("Integrated Logistics", "الحلول اللوجستية المتكاملة"),
        url: "/services/integrated-logistics",
        page: null,
        external: false,
        enabled: true,
        sort_order: 5,
        children: [],
      },
    ],
  },
  {
    id: "menu-careers",
    label: localize("Careers", "الوظائف"),
    url: "/careers",
    page: null,
    external: false,
    enabled: true,
    sort_order: 4,
    children: [],
  },
  {
    id: "menu-contact",
    label: localize("Contact Us", "اتصل بنا"),
    url: "/contact",
    page: null,
    external: false,
    enabled: true,
    sort_order: 5,
    children: [],
  },
  {
    id: "menu-blog",
    label: localize("Blog", "المدونة"),
    url: "/blog",
    page: null,
    external: false,
    enabled: true,
    sort_order: 6,
    children: [],
  },
];
