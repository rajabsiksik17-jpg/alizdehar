export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) || "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function oppositeLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/** A text value available in both locales. */
export interface LocalizedText {
  en: string;
  ar: string;
}

/** Pick the locale-specific value from a localized field. */
export function pick(value: LocalizedText | string | null | undefined, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? "";
}

/** A localizable object helper: { en, ar }. */
export function localize(en: string, ar: string): LocalizedText {
  return { en, ar };
}

/* ─────────────────────────────────────────────────────────────
   Static interface strings (UI chrome only).
   Content strings come from the CMS / data layer, never here.
   ───────────────────────────────────────────────────────────── */

const dictionary = {
  en: {
    nav: {
      home: "Home",
      about: "About Us",
      services: "Services & Solutions",
      careers: "Careers",
      contact: "Contact Us",
      blog: "Blog",
    },
    actions: {
      requestQuote: "Request a Quote",
      getQuote: "Get a Shipping Quote",
      contactUs: "Contact Us",
      learnMore: "Learn More",
      readMore: "Read More",
      exploreService: "Explore Service",
      viewAll: "View All",
      backHome: "Back to Home",
      viewServices: "View Services",
      talkToTeam: "Talk to Our Logistics Team",
      trackShipment: "Track Your Shipment",
      applyNow: "Apply Now",
      submit: "Submit",
      sending: "Sending…",
    },
    common: {
      yearsExperience: "Years of Experience",
      since: "Since 1982",
      trustedBy: "Trusted By",
      ourServices: "Our Services",
      whyChooseUs: "Why Al-Izdehar",
      relatedServices: "Related Services",
      relatedArticles: "Related Articles",
      faq: "Frequently Asked Questions",
      statistics: "Our Numbers",
      ourClients: "Our Clients",
      blog: "Insights & Blog",
      getInTouch: "Get in Touch",
      home: "Home",
      testimonials: "What Our Clients Say",
    },
    header: {
      menu: "Menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
    },
    footer: {
      shortAbout: "Short About",
      services: "Services",
      quickLinks: "Quick Links",
      contact: "Contact",
      followUs: "Follow Us",
      newsletter: "Newsletter",
      newsletterText: "Subscribe for logistics insights and updates.",
      emailPlaceholder: "Your email address",
      subscribe: "Subscribe",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
    },
    quote: {
      title: "Request a Quote",
      subtitle: "Tell us about your shipment and our team will get back to you.",
      service: "Service",
      servicePlaceholder: "Select a service",
      name: "Full Name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      country: "Country",
      origin: "Origin",
      destination: "Destination",
      shipmentType: "Shipment Type",
      cargoType: "Cargo Type",
      weight: "Weight",
      dimensions: "Dimensions",
      containerType: "Container Type",
      containers: "Number of Containers",
      method: "Preferred Shipping Method",
      date: "Expected Shipping Date",
      message: "Message",
      attachment: "Attachment",
      submit: "Send Request",
      success: "Thank you. Your request has been received.",
      error: "Something went wrong. Please try again.",
    },
    notFound: {
      title: "Looks like this shipment took a different route.",
      description: "The page you are looking for could not be found.",
      cta: "Back to Home",
    },
    cookie: {
      text: "We use cookies to enhance your experience and analyze site traffic.",
      accept: "Accept",
      decline: "Decline",
      policy: "Privacy Policy",
    },
    search: {
      placeholder: "Search services, articles and pages…",
      noResults: "No results found.",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      about: "من نحن",
      services: "الخدمات والحلول",
      careers: "الوظائف",
      contact: "اتصل بنا",
      blog: "المدونة",
    },
    actions: {
      requestQuote: "اطلب عرض سعر",
      getQuote: "احصل على عرض سعر للشحن",
      contactUs: "اتصل بنا",
      learnMore: "اعرف المزيد",
      readMore: "اقرأ المزيد",
      exploreService: "استكشف الخدمة",
      viewAll: "عرض الكل",
      backHome: "العودة للرئيسية",
      viewServices: "عرض الخدمات",
      talkToTeam: "تحدث إلى فريقنا اللوجستي",
      trackShipment: "تتبع شحنتك",
      applyNow: "قدّم الآن",
      submit: "إرسال",
      sending: "جارٍ الإرسال…",
    },
    common: {
      yearsExperience: "سنوات من الخبرة",
      since: "منذ 1982",
      trustedBy: "يثق بنا",
      ourServices: "خدماتنا",
      whyChooseUs: "لماذا الإزدهار",
      relatedServices: "خدمات ذات صلة",
      relatedArticles: "مقالات ذات صلة",
      faq: "الأسئلة الشائعة",
      statistics: "أرقامنا",
      ourClients: "عملاؤنا",
      blog: "المدونة والمقالات",
      getInTouch: "تواصل معنا",
      home: "الرئيسية",
      testimonials: "ماذا يقول عملاؤنا",
    },
    header: {
      menu: "القائمة",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
      language: "اللغة",
    },
    footer: {
      shortAbout: "نبذة مختصرة",
      services: "الخدمات",
      quickLinks: "روابط سريعة",
      contact: "التواصل",
      followUs: "تابعنا",
      newsletter: "النشرة البريدية",
      newsletterText: "اشترك للحصول على رؤى وتحديثات لوجستية.",
      emailPlaceholder: "بريدك الإلكتروني",
      subscribe: "اشترك",
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام",
    },
    quote: {
      title: "اطلب عرض سعر",
      subtitle: "أخبرنا عن شحنتك وسيتواصل معك فريقنا.",
      service: "الخدمة",
      servicePlaceholder: "اختر خدمة",
      name: "الاسم الكامل",
      company: "الشركة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      country: "الدولة",
      origin: "نقطة الانطلاق",
      destination: "الوجهة",
      shipmentType: "نوع الشحنة",
      cargoType: "نوع البضاعة",
      weight: "الوزن",
      dimensions: "الأبعاد",
      containerType: "نوع الحاوية",
      containers: "عدد الحاويات",
      method: "وسيلة الشحن المفضلة",
      date: "تاريخ الشحن المتوقع",
      message: "الرسالة",
      attachment: "مرفق",
      submit: "إرسال الطلب",
      success: "شكراً لك. تم استلام طلبك.",
      error: "حدث خطأ ما. حاول مرة أخرى.",
    },
    notFound: {
      title: "يبدو أن هذه الشحنة سلكت طريقاً مختلفاً.",
      description: "الصفحة التي تبحث عنها غير موجودة.",
      cta: "العودة للرئيسية",
    },
    cookie: {
      text: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور.",
      accept: "قبول",
      decline: "رفض",
      policy: "سياسة الخصوصية",
    },
    search: {
      placeholder: "ابحث في الخدمات والمقالات والصفحات…",
      noResults: "لا توجد نتائج.",
    },
  },
} as const;

export type Dictionary = (typeof dictionary)["en"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionary[locale] as unknown as Dictionary;
}
