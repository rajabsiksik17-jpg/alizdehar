import type { Page, PageSection } from "@/types";
import { localize } from "@/lib/i18n/config";

function legalPage(
  slug: string,
  titleEn: string,
  titleAr: string,
  bodyEn: string,
  bodyAr: string,
): Page {
  const sections: PageSection[] = [
    {
      id: `${slug}-hero`,
      type: "page_hero",
      title: localize(titleEn, titleAr),
      subtitle: null,
      body: null,
      image: null,
      items: [],
      settings: {},
      hidden: false,
      sort_order: 1,
    },
    {
      id: `${slug}-intro`,
      type: "rich_text",
      title: localize(titleEn, titleAr),
      subtitle: null,
      body: localize(bodyEn, bodyAr),
      image: null,
      items: [],
      settings: { align: "start" },
      hidden: false,
      sort_order: 2,
    },
  ];

  return {
    id: `page-${slug}`,
    slug,
    title: localize(titleEn, titleAr),
    menu_title: localize(titleEn, titleAr),
    status: "published",
    sections,
    seo: {
      seo_title: localize(titleEn, titleAr),
      seo_description: localize(bodyEn.slice(0, 160), bodyAr.slice(0, 160)),
      focus_keyword: localize(titleEn, titleAr),
      canonical_url: null,
      noindex: false,
      og_title: null,
      og_description: null,
      og_image: null,
      schema_type: null,
    },
  };
}

export const privacyPage: Page = legalPage(
  "privacy",
  "Privacy Policy",
  "سياسة الخصوصية",
  "This Privacy Policy explains how Al-Izdehar Logistics collects, uses and protects your personal information when you use our website and services.",
  "توضح سياسة الخصوصية هذه كيفية قيام الإزدهار للوجستيات بجمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا وخدماتنا.",
);

export const termsPage: Page = legalPage(
  "terms",
  "Terms & Conditions",
  "الشروط والأحكام",
  "These Terms & Conditions govern your use of the Al-Izdehar Logistics website and services. By using this website you agree to these terms.",
  "تحكم هذه الشروط والأحكام استخدامك لموقع وخدمات الإزدهار للوجستيات. وباستخدامك لهذا الموقع فإنك توافق على هذه الشروط.",
);
