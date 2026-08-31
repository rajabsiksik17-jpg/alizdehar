import type {
  BlogPost,
  Career,
  ClientLogo,
  GalleryItem,
  Testimonial,
  ProcessStep,
  ServiceFeature,
} from "@/types";
import { localize } from "@/lib/i18n/config";

/*
 * Social-proof and editorial content.
 * Intentionally empty — the source document contains no testimonials,
 * client logos, blog posts, careers or gallery items, and we must not
 * invent any. Everything here is populated from the CMS.
 */

export const seedTestimonials: Testimonial[] = [];
export const seedClients: ClientLogo[] = [];
export const seedBlogPosts: BlogPost[] = [];
export const seedGallery: GalleryItem[] = [];

/*
 * DEMO career data — for demonstration purposes ONLY.
 * These are sample vacancies, not real open positions. Marked `demo: true`
 * so the CMS/admin can distinguish them from approved content. Replace or
 * delete them from the admin Careers manager.
 */
export const seedCareers: Career[] = [
  {
    id: "job-logistics-coordinator",
    slug: "logistics-coordinator",
    title: localize("Logistics Coordinator", "منسق لوجستي"),
    department: localize("Operations", "العمليات"),
    location: localize("Amman, Jordan", "عمّان، الأردن"),
    employment_type: localize("Full-time", "دوام كامل"),
    description: localize(
      "Coordinate the day-to-day movement of shipments across sea, land and air, liaising with clients, carriers and customs teams to ensure cargo is delivered safely and on schedule.",
      "تنسيق الحركة اليومية للشحنات عبر البحر والبر والجو، والتواصل مع العملاء والناقلين وفرق الجمارك لضمان تسليم البضائع بأمان وفي الموعد المحدد.",
    ),
    responsibilities: localize(
      "Track shipments and update clients on status.\nCoordinate with carriers, ports and warehouses.\nPrepare and review shipping documentation.\nSupport customs clearance coordination.",
      "تتبع الشحنات وإطلاع العملاء على حالتها.\nالتنسيق مع الناقلين والموانئ والمستودعات.\nإعداد ومراجعة مستندات الشحن.\nدعم تنسيق التخليص الجمركي.",
    ),
    requirements: localize(
      "1–3 years in logistics or freight forwarding.\nStrong organizational and communication skills.\nProficiency in English (Arabic is a plus).",
      "خبرة من 1 إلى 3 سنوات في اللوجستيات أو الشحن.\nمهارات تنظيمية وتواصل قوية.\nإجادة اللغة الإنجليزية (والعربية ميزة إضافية).",
    ),
    preferred: localize(
      "Experience with sea freight documentation and customs procedures.",
      "خبرة في مستندات الشحن البحري والإجراءات الجمركية.",
    ),
    benefits: localize(
      "Competitive salary and career development.",
      "راتب تنافسي وفرص تطوير مهني.",
    ),
    deadline: null,
    status: "published",
    demo: true,
  },
  {
    id: "job-customs-specialist",
    slug: "customs-clearance-specialist",
    title: localize("Customs Clearance Specialist", "أخصائي تخليص جمركي"),
    department: localize("Customs", "الجمارك"),
    location: localize("Amman, Jordan", "عمّان، الأردن"),
    employment_type: localize("Full-time", "دوام كامل"),
    description: localize(
      "Manage customs clearance procedures for import and export shipments, ensuring accurate documentation and coordination with customs authorities.",
      "إدارة إجراءات التخليص الجمركي لشحنات الاستيراد والتصدير، مع ضمان دقة المستندات والتنسيق مع الجهات الجمركية.",
    ),
    responsibilities: localize(
      "Prepare and submit customs declarations.\nCoordinate inspections and examinations.\nFollow up on clearance procedures and cargo release.\nSupport classification and valuation.",
      "إعداد وتقديم البيانات الجمركية.\nتنسيق الفحص والمعاينة.\nمتابعة إجراءات التخليص والإفراج عن البضائع.\nدعم التصنيف والتقييم الجمركي.",
    ),
    requirements: localize(
      "2+ years in customs clearance.\nStrong attention to detail and compliance awareness.",
      "خبرة تزيد عن سنتين في التخليص الجمركي.\nاهتمام قوي بالتفاصيل وإدراك للامتثال.",
    ),
    preferred: localize(
      "Knowledge of import/export regulations and documentation requirements.",
      "معرفة بلوائح الاستيراد/التصدير ومتطلبات المستندات.",
    ),
    benefits: localize(
      "Professional development in international trade.",
      "تطوير مهني في مجال التجارة الدولية.",
    ),
    deadline: null,
    status: "published",
    demo: true,
  },
  {
    id: "job-air-operations",
    slug: "air-freight-operations-officer",
    title: localize("Air Freight Operations Officer", "مسؤول عمليات الشحن الجوي"),
    department: localize("Air Freight", "الشحن الجوي"),
    location: localize("Amman, Jordan", "عمّان، الأردن"),
    employment_type: localize("Full-time", "دوام كامل"),
    description: localize(
      "Coordinate air freight operations, including airline bookings, AWB documentation and customs handoff for time-sensitive shipments.",
      "تنسيق عمليات الشحن الجوي، بما في ذلك حجوزات شركات الطيران ومستندات AWB وتسليم الجمارك للشحنات الحساسة للوقت.",
    ),
    responsibilities: localize(
      "Coordinate air bookings and routing.\nPrepare airway bills and documentation.\nMonitor urgent and high-value shipments.\nLiaise with airlines, airports and customs.",
      "تنسيق الحجوزات الجوية والتوجيه.\nإعداد بوالص الشحن الجوي والمستندات.\nمراقبة الشحنات العاجلة وعالية القيمة.\nالتواصل مع شركات الطيران والمطارات والجمارك.",
    ),
    requirements: localize(
      "1–3 years in air freight operations.\nAbility to work under time pressure.",
      "خبرة من 1 إلى 3 سنوات في عمليات الشحن الجوي.\nالقدرة على العمل تحت ضغط الوقت.",
    ),
    preferred: localize(
      "Familiarity with AWB and IATA documentation.",
      "إلمام بمستندات AWB و IATA.",
    ),
    benefits: localize(
      "Dynamic international environment.",
      "بيئة دولية ديناميكية.",
    ),
    deadline: null,
    status: "published",
    demo: true,
  },
  {
    id: "job-sales-executive",
    slug: "sales-executive",
    title: localize("Sales Executive", "مسؤول مبيعات"),
    department: localize("Sales", "المبيعات"),
    location: localize("Amman, Jordan", "عمّان، الأردن"),
    employment_type: localize("Full-time", "دوام كامل"),
    description: localize(
      "Grow the client portfolio by identifying freight and logistics opportunities and preparing tailored shipping solutions and quotes.",
      "تنمية محفظة العملاء من خلال تحديد فرص الشحن واللوجستيات وإعداد حلول شحن وعروض أسعار مخصصة.",
    ),
    responsibilities: localize(
      "Identify and pursue new business opportunities.\nPrepare quotations and proposals.\nBuild long-term client relationships.\nCoordinate with operations on client requirements.",
      "تحديد ومتابعة فرص الأعمال الجديدة.\nإعداد عروض الأسعار والمقترحات.\nبناء علاقات طويلة الأمد مع العملاء.\nالتنسيق مع العمليات بشأن متطلبات العملاء.",
    ),
    requirements: localize(
      "Proven sales experience (logistics is a plus).\nExcellent communication and negotiation skills.",
      "خبرة مثبتة في المبيعات (اللوجستيات ميزة إضافية).\nمهارات تواصل وتفاوض ممتازة.",
    ),
    preferred: localize(
      "Existing network in import/export or freight.",
      "شبكة علاقات قائمة في الاستيراد/التصدير أو الشحن.",
    ),
    benefits: localize(
      "Commission structure and growth opportunities.",
      "نظام عمولات وفرص نمو.",
    ),
    deadline: null,
    status: "published",
    demo: true,
  },
];

/*
 * Cargo type taxonomy — editable from the CMS (`cargo_types` table).
 * These are general, factual logistics categories (not company facts).
 */
export const seedCargoTypes = [
  localize("General Cargo", "بضائع عامة"),
  localize("Commercial Goods", "بضائع تجارية"),
  localize("Documents", "مستندات"),
  localize("Machinery", "آلات ومعدات"),
  localize("Electronics", "إلكترونيات"),
  localize("Fragile Cargo", "بضائع قابلة للكسر"),
  localize("High-Value Cargo", "بضائع عالية القيمة"),
  localize("Perishable Goods", "بضائع قابلة للتلف"),
  localize("Oversized Cargo", "بضائع كبيرة الحجم"),
  localize("Other", "أخرى"),
];

/*
 * Shared demo blocks — editable from the CMS.
 * These are generic logistics process/value statements (not company facts).
 */

export const howItWorksSteps: ProcessStep[] = [
  {
    id: "how-1",
    icon: "clipboard-list",
    title: localize("Tell Us About Your Shipment", "أخبرنا عن شحنتك"),
    description: localize(
      "Share your shipment requirements, cargo details and preferred shipping date.",
      "شارك متطلبات شحنتك وتفاصيل البضاعة وتاريخ الشحن المفضل.",
    ),
  },
  {
    id: "how-2",
    icon: "puzzle",
    title: localize("We Build the Right Solution", "نصمم الحل المناسب"),
    description: localize(
      "Our team evaluates your requirements and selects the appropriate logistics solution.",
      "يقيّم فريقنا متطلباتك ويختار الحل اللوجستي المناسب.",
    ),
  },
  {
    id: "how-3",
    icon: "workflow",
    title: localize("We Coordinate the Journey", "ننسق رحلة الشحنة"),
    description: localize(
      "We coordinate transportation, documentation and required logistics processes.",
      "ننسق النقل والمستندات والعمليات اللوجستية المطلوبة.",
    ),
  },
  {
    id: "how-4",
    icon: "route",
    title: localize("Your Cargo Moves", "تبدأ الشحنة رحلتها"),
    description: localize(
      "Your shipment moves through the selected transportation network with coordinated handling.",
      "تتحرك شحنتك عبر شبكة النقل المختارة بمناولة منسقة.",
    ),
  },
  {
    id: "how-5",
    icon: "monitor",
    title: localize("We Keep You Informed", "نبقيك على اطلاع"),
    description: localize(
      "Receive updates and maintain visibility throughout the shipment journey.",
      "استلم التحديثات وحافظ على الرؤية طوال رحلة الشحنة.",
    ),
  },
  {
    id: "how-6",
    icon: "package-check",
    title: localize("Delivery Completed", "تكتمل عملية التسليم"),
    description: localize(
      "Your shipment reaches its destination with coordinated delivery support.",
      "تصل شحنتك إلى وجهتها مع دعم تسليم منسق.",
    ),
  },
];

export const whyChooseItems: ServiceFeature[] = [
  {
    id: "why-1",
    icon: "shield-check",
    title: localize("Experience You Can Rely On", "خبرة يمكنك الاعتماد عليها"),
    description: localize(
      "Decades of logistics experience supporting the movement of cargo across different transportation channels.",
      "عقود من الخبرة اللوجستية تدعم حركة البضائع عبر قنوات نقل مختلفة.",
    ),
  },
  {
    id: "why-2",
    icon: "workflow",
    title: localize("Integrated Logistics Thinking", "حلول لوجستية متكاملة"),
    description: localize(
      "We coordinate multiple logistics requirements through a connected approach.",
      "ننسق متطلبات لوجستية متعددة عبر نهج متصل.",
    ),
  },
  {
    id: "why-3",
    icon: "sliders",
    title: localize("Flexible Solutions", "حلول مرنة"),
    description: localize(
      "Solutions are adapted to shipment requirements rather than forcing every shipment into the same model.",
      "تُكيّف الحلول وفق متطلبات الشحنة بدلاً من فرض نموذج واحد على كل شحنة.",
    ),
  },
  {
    id: "why-4",
    icon: "message-square",
    title: localize("Clear Communication", "تواصل واضح"),
    description: localize(
      "Clear communication and shipment updates help customers stay informed.",
      "يساعد التواصل الواضح وتحديثات الشحن العملاء على البقاء على اطلاع.",
    ),
  },
  {
    id: "why-5",
    icon: "clipboard-list",
    title: localize("Professional Coordination", "تنسيق احترافي"),
    description: localize(
      "Careful coordination of documentation, transportation and shipment handling.",
      "تنسيق دقيق للمستندات والنقل ومناولة الشحنات.",
    ),
  },
  {
    id: "why-6",
    icon: "user-check",
    title: localize("Customer-Focused Service", "خدمة تضع العميل أولاً"),
    description: localize(
      "Every shipment starts with understanding the customer's requirements.",
      "تبدأ كل شحنة بفهم متطلبات العميل.",
    ),
  },
];
