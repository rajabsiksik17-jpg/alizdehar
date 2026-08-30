import type { Page, PageSection, Statistic, WhyUsItem } from "@/types";
import { localize } from "@/lib/i18n/config";

/*
 * Homepage sections. Built as a reorderable section list so the admin can
 * drag/drop, hide, or edit each block from the CMS.
 */

const homeSections: PageSection[] = [
  {
    id: "home-hero",
    type: "hero",
    title: localize(
      "Your world is bigger… and your shipment deserves to go further.",
      "عالمك أكبر… وشحنتك تستحق أن تذهب أبعد.",
    ),
    subtitle: localize(
      "With Al-Izdehar Logistics, we put our expertise and global network at your service.",
      "مع الإزدهار للوجستيات، نضع خبرتنا وشبكتنا العالمية في خدمتك.",
    ),
    body: localize(
      "Transport with confidence… Arrive successfully.",
      "انقل بثقة… صِل بنجاح.",
    ),
    image: null,
    items: [
      {
        id: "hero-sea",
        title: localize("Sea Freight", "الشحن البحري"),
        subtitle: localize("Reliable Global Shipping by Sea", "شحن عالمي موثوق عبر البحر"),
        description: localize(
          "Economical and flexible options for transporting shipments and containers worldwide.",
          "خيارات اقتصادية ومرنة لنقل الشحنات والحاويات حول العالم.",
        ),
        icon: "ship",
        url: "/services/sea-freight",
        cta: localize("Explore Sea Freight", "استكشف الشحن البحري"),
      },
      {
        id: "hero-air",
        title: localize("Air Freight", "الشحن الجوي"),
        subtitle: localize("Fast, Reliable Shipping Across the Globe", "شحن سريع وموثوق حول العالم"),
        description: localize(
          "Fast and reliable air freight solutions for urgent and critical shipments.",
          "حلول شحن جوي سريعة وموثوقة للشحنات العاجلة والحرجة.",
        ),
        icon: "plane",
        url: "/services/air-freight",
        cta: localize("Explore Air Freight", "استكشف الشحن الجوي"),
      },
      {
        id: "hero-land",
        title: localize("Land Freight", "الشحن البري"),
        subtitle: localize("Reliable Road Transportation Across Borders", "نقل بري موثوق عبر الحدود"),
        description: localize(
          "Safe and efficient land transport connecting ports, airports and warehouses.",
          "نقل بري آمن وفعال يربط الموانئ والمطارات والمستودعات.",
        ),
        icon: "truck",
        url: "/services/land-freight",
        cta: localize("Explore Land Freight", "استكشف الشحن البري"),
      },
      {
        id: "hero-customs",
        title: localize("Customs Clearance", "التخليص الجمركي"),
        subtitle: localize("Simplifying Customs. Accelerating Your Business.", "تبسيط الجمارك. تسريع أعمالك."),
        description: localize(
          "Efficiently manage customs clearance to facilitate the movement of your goods and minimize delays.",
          "إدارة فعالة للتخليص الجمركي لتسهيل حركة بضائعك وتقليل التأخير.",
        ),
        icon: "stamp",
        url: "/services/customs-clearance",
        cta: localize("Explore Customs Clearance", "استكشف التخليص الجمركي"),
      },
      {
        id: "hero-integrated",
        title: localize("Integrated Logistics", "الحلول اللوجستية المتكاملة"),
        subtitle: localize("One Partner. One Solution. From Origin to Destination.", "شريك واحد. حل واحد. من نقطة الانطلاق إلى الوجهة."),
        description: localize(
          "Integrated supply chain management, from receiving and warehousing to final delivery.",
          "إدارة متكاملة لسلسلة التوريد، من الاستلام والتخزين إلى التسليم النهائي.",
        ),
        icon: "network",
        url: "/services/integrated-logistics",
        cta: localize("Explore Integrated Logistics", "استكشف اللوجستيات المتكاملة"),
      },
    ],
    settings: { autoplay: true, interval: 6000, overlay: true, height: "lg" },
    hidden: false,
    sort_order: 1,
  },
  {
    id: "home-trust",
    type: "trust",
    title: null,
    subtitle: null,
    body: null,
    image: null,
    items: [
      { id: "trust-1", label: localize("More than 40 years of experience", "خبرة تتجاوز 40 عاماً"), icon: "award" },
      { id: "trust-2", label: localize("Customs clearance expertise", "خبرة في التخليص الجمركي"), icon: "stamp" },
      { id: "trust-3", label: localize("Integrated logistics solutions", "حلول لوجستية متكاملة"), icon: "network" },
      { id: "trust-4", label: localize("Professional coordination", "تنسيق احترافي"), icon: "handshake" },
      { id: "trust-5", label: localize("Global connectivity", "اتصال عالمي"), icon: "globe" },
    ],
    settings: {},
    hidden: false,
    sort_order: 2,
  },
  {
    id: "home-services",
    type: "services_grid",
    title: localize("Al-Izdehar Solutions", "حلول الإزدهار"),
    subtitle: localize(
      "Integrated shipping and logistics solutions that connect your business to global markets.",
      "حلول شحن ولوجستيات متكاملة تربط أعمالك بالأسواق العالمية.",
    ),
    body: null,
    image: null,
    items: [],
    settings: {},
    hidden: false,
    sort_order: 3,
  },
  {
    id: "home-why",
    type: "features",
    title: localize("Why Choose Al-Izdehar", "لماذا تختار الإزدهار"),
    subtitle: localize(
      "We treat every business, shipment and challenge as if it were our own.",
      "نتعامل مع كل عمل وشحنة وتحدٍ كما لو كانت ملكاً لنا.",
    ),
    body: null,
    image: null,
    items: [],
    settings: { columns: 4 },
    hidden: false,
    sort_order: 4,
  },
  {
    id: "home-journey",
    type: "process",
    title: localize("Your Logistics Journey", "رحلتك اللوجستية"),
    subtitle: localize(
      "From origin to destination — coordinated across every mode of transport.",
      "من نقطة الانطلاق إلى الوجهة — بتنسيق عبر جميع وسائل النقل.",
    ),
    body: null,
    image: null,
    items: [
      { id: "j-1", label: localize("Origin", "نقطة الانطلاق"), description: localize("Cargo collection", "جمع البضائع"), icon: "package" },
      { id: "j-2", label: localize("Sea / Air / Land", "بحر / جو / بر"), description: localize("Multimodal transport", "نقل متعدد الوسائط"), icon: "ship" },
      { id: "j-3", label: localize("Customs", "الجمارك"), description: localize("Clearance & coordination", "التخليص والتنسيق"), icon: "stamp" },
      { id: "j-4", label: localize("Destination", "الوجهة"), description: localize("Final delivery", "التسليم النهائي"), icon: "map-pin" },
    ],
    settings: { animated: true },
    hidden: false,
    sort_order: 5,
  },
  {
    id: "home-customs",
    type: "image_text",
    title: localize("Al-Izdehar Customs Clearance", "التخليص الجمركي مع الإزدهار"),
    subtitle: localize(
      "Simplifying Customs. Accelerating Your Business.",
      "تبسيط الجمارك. تسريع أعمالك.",
    ),
    body: localize(
      "Efficiently manage customs clearance procedures to facilitate the movement of your goods and minimize delays. We offer integrated supply chain management solutions, from receiving and warehousing to final delivery.",
      "إدارة فعالة لإجراءات التخليص الجمركي لتسهيل حركة بضائعك وتقليل التأخير. نقدم حلول إدارة متكاملة لسلسلة التوريد، من الاستلام والتخزين إلى التسليم النهائي.",
    ),
    image: null,
    items: [
      { id: "c-1", label: localize("Import & export clearance", "تخليص الاستيراد والتصدير") },
      { id: "c-2", label: localize("Documentation & declarations", "المستندات والبيانات") },
      { id: "c-3", label: localize("Authority & port coordination", "التنسيق مع الجهات والموانئ") },
      { id: "c-4", label: localize("Duty & tax support", "دعم الرسوم والضرائب") },
    ],
    settings: { layout: "image_right", link: "/services/customs-clearance" },
    hidden: false,
    sort_order: 6,
  },
  {
    id: "home-integrated",
    type: "text_image",
    title: localize("Integrated Logistics Solutions", "الحلول اللوجستية المتكاملة"),
    subtitle: localize(
      "One Partner. One Solution. From Origin to Destination.",
      "شريك واحد. حل واحد. من نقطة الانطلاق إلى الوجهة.",
    ),
    body: localize(
      "We offer integrated supply chain management solutions, from receiving and warehousing to final delivery — combining sea, land and air freight with customs clearance.",
      "نقدم حلول إدارة متكاملة لسلسلة التوريد، من الاستلام والتخزين إلى التسليم النهائي — بدمج الشحن البحري والبري والجوي مع التخليص الجمركي.",
    ),
    image: null,
    items: [
      { id: "i-1", label: localize("End-to-end logistics", "لوجستيات شاملة") },
      { id: "i-2", label: localize("Multimodal transportation", "نقل متعدد الوسائط") },
      { id: "i-3", label: localize("Warehousing & distribution", "التخزين والتوزيع") },
      { id: "i-4", label: localize("Cost-efficient planning", "تخطيط فعال من حيث التكلفة") },
    ],
    settings: { layout: "image_left", link: "/services/integrated-logistics" },
    hidden: false,
    sort_order: 7,
  },
  {
    id: "home-stats",
    type: "statistics",
    title: null,
    subtitle: null,
    body: null,
    image: null,
    items: [],
    settings: {},
    hidden: false,
    sort_order: 8,
  },
  {
    id: "home-faq",
    type: "faq",
    title: localize("Frequently Asked Questions", "الأسئلة الشائعة"),
    subtitle: null,
    body: null,
    image: null,
    items: [],
    settings: {},
    hidden: false,
    sort_order: 9,
  },
  {
    id: "home-cta",
    type: "cta",
    title: localize("Transport with Confidence. Arrive Successfully.", "انقل بثقة… صِل بنجاح"),
    subtitle: localize(
      "Let us take care of the logistics while you focus on growing your business.",
      "دعنا نهتم باللوجستيات بينما تركز على تنمية أعمالك.",
    ),
    body: null,
    image: null,
    items: [
      { id: "cta-1", label: localize("Request a Quote", "اطلب عرض سعر"), url: "/quote", variant: "primary" },
      { id: "cta-2", label: localize("Contact Us", "اتصل بنا"), url: "/contact", variant: "secondary" },
    ],
    settings: {},
    hidden: false,
    sort_order: 10,
  },
];

export const homePage: Page = {
  id: "page-home",
  slug: "home",
  title: localize("Home", "الرئيسية"),
  menu_title: localize("Home", "الرئيسية"),
  status: "published",
  sections: homeSections,
  seo: {
    seo_title: localize(
      "Al-Izdehar Logistics | Sea, Air & Land Freight and Customs Clearance",
      "الإزدهار للوجستيات | الشحن البحري والجوي والبري والتخليص الجمركي",
    ),
    seo_description: localize(
      "Integrated shipping and logistics solutions connecting your business to global markets through air, sea and land freight, with customs clearance expertise since 1982.",
      "حلول شحن ولوجستيات متكاملة تربط أعمالك بالأسواق العالمية عبر الشحن الجوي والبحري والبري، مع خبرة في التخليص الجمركي منذ عام 1982.",
    ),
    focus_keyword: localize("Logistics & Shipping", "اللوجستيات والشحن"),
    canonical_url: null,
    noindex: false,
    og_title: null,
    og_description: null,
    og_image: null,
    schema_type: "Organization",
  },
};

/* ── Why choose us (global reusable items) ─────────────────── */

export const seedWhyUs: WhyUsItem[] = [
  {
    id: "why-1",
    title: localize("More Than 40 Years of Experience", "خبرة تتجاوز 40 عاماً"),
    description: localize(
      "Backed by more than four decades of experience in customs clearance and international trade-related services.",
      "مدعومون بأكثر من أربعة عقود من الخبرة في التخليص الجمركي والخدمات المتعلقة بالتجارة الدولية.",
    ),
    icon: "award",
    sort_order: 1,
    enabled: true,
  },
  {
    id: "why-2",
    title: localize("Professional Team", "فريق محترف"),
    description: localize(
      "A highly motivated and specialized team in logistics and shipping, guided by visionary management.",
      "فريق متخصص ومتحمس في اللوجستيات والشحن، بقيادة إدارة ذات رؤية.",
    ),
    icon: "users",
    sort_order: 2,
    enabled: true,
  },
  {
    id: "why-3",
    title: localize("Flexible Solutions", "حلول مرنة"),
    description: localize(
      "Comprehensive, flexible and cost-effective logistics solutions tailored to every client.",
      "حلول لوجستية شاملة ومرنة وفعالة من حيث التكلفة مصممة لكل عميل.",
    ),
    icon: "sliders",
    sort_order: 3,
    enabled: true,
  },
  {
    id: "why-4",
    title: localize("Cost Efficiency", "كفاءة في التكلفة"),
    description: localize(
      "Practical solutions that balance service quality, transit requirements and overall costs.",
      "حلول عملية توازن بين جودة الخدمة ومتطلبات العبور والتكاليف الإجمالية.",
    ),
    icon: "coins",
    sort_order: 4,
    enabled: true,
  },
  {
    id: "why-5",
    title: localize("Global Connectivity", "اتصال عالمي"),
    description: localize(
      "A network of shipping and logistics partners connecting your business to international markets.",
      "شبكة من شركاء الشحن واللوجستيات تربط أعمالك بالأسواق الدولية.",
    ),
    icon: "globe",
    sort_order: 5,
    enabled: true,
  },
  {
    id: "why-6",
    title: localize("Customs Expertise", "خبرة جمركية"),
    description: localize(
      "Decades of practical experience in handling customs procedures and requirements.",
      "عقود من الخبرة العملية في التعامل مع الإجراءات والمتطلبات الجمركية.",
    ),
    icon: "stamp",
    sort_order: 6,
    enabled: true,
  },
  {
    id: "why-7",
    title: localize("End-to-End Support", "دعم شامل من البداية إلى النهاية"),
    description: localize(
      "From documentation and customs clearance to transportation and final delivery.",
      "من المستندات والتخليص الجمركي إلى النقل والتسليم النهائي.",
    ),
    icon: "route",
    sort_order: 7,
    enabled: true,
  },
  {
    id: "why-8",
    title: localize("Client-Focused Service", "خدمة تركز على العميل"),
    description: localize(
      "We consider our clients our partners and treat every shipment as our own.",
      "نعتبر عملاءنا شركاءنا ونتعامل مع كل شحنة كما لو كانت شحنتنا.",
    ),
    icon: "heart-handshake",
    sort_order: 8,
    enabled: true,
  },
];

/* ── Statistics (only facts present in the source document) ── */

export const seedStatistics: Statistic[] = [
  {
    id: "stat-1",
    value: "40",
    label: localize("Years of Experience", "سنوات من الخبرة"),
    suffix: "+",
    sort_order: 1,
    enabled: true,
  },
  {
    id: "stat-2",
    value: "1982",
    label: localize("Year Founded", "سنة التأسيس"),
    suffix: null,
    sort_order: 2,
    enabled: true,
  },
  {
    id: "stat-3",
    value: "5",
    label: localize("Core Services", "خدمات أساسية"),
    suffix: null,
    sort_order: 3,
    enabled: true,
  },
  {
    id: "stat-4",
    value: "3",
    label: localize("Freight Modes", "وسائل شحن"),
    suffix: null,
    sort_order: 4,
    enabled: true,
  },
];
