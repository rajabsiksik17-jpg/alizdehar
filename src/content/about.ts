import type { Page, PageSection } from "@/types";
import { localize } from "@/lib/i18n/config";

const aboutSections: PageSection[] = [
  {
    id: "about-hero",
    type: "page_hero",
    title: localize("About Al-Izdehar Logistics", "عن الإزدهار للوجستيات"),
    subtitle: localize(
      "More than 40 years of experience in logistics and customs clearance.",
      "خبرة تتجاوز 40 عاماً في اللوجستيات والتخليص الجمركي.",
    ),
    body: null,
    image: null,
    items: [],
    settings: {},
    hidden: false,
    sort_order: 1,
  },
  {
    id: "about-intro",
    type: "image_text",
    title: localize("Our Story", "قصتنا"),
    subtitle: null,
    body: localize(
      "Al-Izdehar for Logistics and Customs Clearance was founded in 1982 by its Founder and CEO, Mr. Omer Al-Natour. With more than 40 years of experience in customs clearance, Al-Izdehar has built a strong reputation for credibility, reliability, and high-quality services, serving a diverse portfolio of clients across various industries.\n\nThrough dedication, commitment, and the expertise of a highly qualified team, Al-Izdehar has consistently provided its clients with convenience, trust, safety, and professional service.",
      "تأسست الإزدهار للوجستيات والتخليص الجمركي عام 1982 على يد مؤسسها ورئيسها التنفيذي السيد عمر الناطور. وبفضل خبرة تتجاوز 40 عاماً في التخليص الجمركي، بنت الإزدهار سمعة قوية في المصداقية والموثوقية والخدمات عالية الجودة، لخدمة محفظة متنوعة من العملاء في مختلف الصناعات.\n\nمن خلال التفاني والالتزام وخبرة فريق مؤهل تأهيلاً عالياً، وفرت الإزدهار باستمرار لعملائها الراحة والثقة والأمان والخدمة الاحترافية.",
    ),
    image: null,
    items: [],
    settings: { layout: "image_right" },
    hidden: false,
    sort_order: 2,
  },
  {
    id: "about-timeline",
    type: "timeline",
    title: localize("Our Journey", "رحلتنا"),
    subtitle: null,
    body: null,
    image: null,
    items: [
      {
        id: "tl-1982",
        label: "1982",
        title: localize("Founded", "التأسيس"),
        description: localize(
          "Al-Izdehar for Logistics and Customs Clearance was founded by Mr. Omer Al-Natour.",
          "تأسست الإزدهار للوجستيات والتخليص الجمركي على يد السيد عمر الناطور.",
        ),
      },
      {
        id: "tl-growth",
        label: localize("Growth", "النمو"),
        title: localize("Growth & Experience", "النمو والخبرة"),
        description: localize(
          "Decades of credibility, reliability and high-quality services across various industries.",
          "عقود من المصداقية والموثوقية والخدمات عالية الجودة في مختلف الصناعات.",
        ),
      },
      {
        id: "tl-40",
        label: "40+",
        title: localize("More Than 40 Years", "أكثر من 40 عاماً"),
        description: localize(
          "Recognized as one of the leading customs clearance firms in the market.",
          "الاعتراف بها كإحدى شركات التخليص الجمركي الرائدة في السوق.",
        ),
      },
      {
        id: "tl-2026",
        label: "2026",
        title: localize("A New Chapter", "فصل جديد"),
        description: localize(
          "We proudly introduce our sister company, Al-Izdehar Logistics.",
          "نفخر بتقديم شركتنا الشقيقة، الإزدهار للوجستيات.",
        ),
      },
      {
        id: "tl-logistics",
        label: localize("Today", "اليوم"),
        title: localize("Al-Izdehar Logistics", "الإزدهار للوجستيات"),
        description: localize(
          "A specialized team in logistics and shipping, guided by visionary management and a commitment to excellence.",
          "فريق متخصص في اللوجستيات والشحن، بقيادة إدارة ذات رؤية والتزام بالتميز.",
        ),
      },
    ],
    settings: {},
    hidden: false,
    sort_order: 3,
  },
  {
    id: "about-new-chapter",
    type: "text_image",
    title: localize("A New Chapter in Our Journey", "فصل جديد في رحلتنا"),
    subtitle: null,
    body: localize(
      "Today, in 2026, after more than four decades of experience and recognition as one of the leading customs clearance firms in the market, we are proud to introduce our sister company, Al-Izdehar Logistics.\n\nBuilding on our long-standing experience and deep understanding of international trade and customs procedures, Al-Izdehar Logistics brings together a highly motivated and specialized team in logistics and shipping, guided by visionary management and a commitment to excellence.",
      "اليوم، في عام 2026، وبعد أكثر من أربعة عقود من الخبرة والاعتراف بها كإحدى شركات التخليص الجمركي الرائدة في السوق، نفخر بتقديم شركتنا الشقيقة، الإزدهار للوجستيات.\n\nبالاستناد إلى خبرتنا الطويلة وفهمنا العميق للتجارة الدولية والإجراءات الجمركية، تجمع الإزدهار للوجستيات فريقاً متخصصاً ومتحمساً في اللوجستيات والشحن، بقيادة إدارة ذات رؤية والتزام بالتميز.",
    ),
    image: null,
    items: [],
    settings: { layout: "image_left" },
    hidden: false,
    sort_order: 4,
  },
  {
    id: "about-mission",
    type: "rich_text",
    title: localize("Our Mission", "رسالتنا"),
    subtitle: localize(
      "Our mission is to provide comprehensive, flexible, and cost-effective logistics solutions tailored to meet the unique needs and requirements of every client.",
      "رسالتنا هي تقديم حلول لوجستية شاملة ومرنة وفعالة من حيث التكلفة مصممة لتلبية الاحتياجات والمتطلبات الفريدة لكل عميل.",
    ),
    body: localize(
      "We believe that our clients are more than customers — they are our partners. We treat every business, shipment, and challenge as if it were our own, ensuring the highest levels of care, safety, reliability, and efficiency throughout the entire logistics journey.\n\nFrom the moment your shipment begins its journey until it reaches its final destination, Al-Izdehar Logistics is committed to delivering a seamless experience, competitive solutions, and dependable service.",
      "نؤمن بأن عملاءنا أكثر من مجرد زبائن — فهم شركاؤنا. نتعامل مع كل عمل وشحنة وتحدٍ كما لو كانت ملكاً لنا، لضمان أعلى مستويات الرعاية والأمان والموثوقية والكفاءة طوال الرحلة اللوجستية.\n\nمن لحظة بدء رحلة شحنتك حتى وصولها إلى وجهتها النهائية، تلتزم الإزدهار للوجستيات بتقديم تجربة سلسة وحلول تنافسية وخدمة موثوقة.",
    ),
    image: null,
    items: [],
    settings: { align: "center" },
    hidden: false,
    sort_order: 5,
  },
  {
    id: "about-services",
    type: "services_grid",
    title: localize("Our Services", "خدماتنا"),
    subtitle: localize(
      "A wide range of flexible shipping and logistics solutions.",
      "مجموعة واسعة من حلول الشحن واللوجستيات المرنة.",
    ),
    body: null,
    image: null,
    items: [],
    settings: {},
    hidden: false,
    sort_order: 6,
  },
  {
    id: "about-cta",
    type: "cta",
    title: localize("Transport with Confidence. Arrive Successfully.", "انقل بثقة… صِل بنجاح"),
    subtitle: null,
    body: null,
    image: null,
    items: [
      { id: "about-cta-1", label: localize("Request a Quote", "اطلب عرض سعر"), url: "/quote", variant: "primary" },
      { id: "about-cta-2", label: localize("Explore Our Services", "استكشف خدماتنا"), url: "/services", variant: "secondary" },
    ],
    settings: {},
    hidden: false,
    sort_order: 7,
  },
];

export const aboutPage: Page = {
  id: "page-about",
  slug: "about",
  title: localize("About Us", "من نحن"),
  menu_title: localize("About Us", "من نحن"),
  status: "published",
  sections: aboutSections,
  seo: {
    seo_title: localize(
      "About Al-Izdehar Logistics | 40+ Years of Customs Clearance Expertise",
      "عن الإزدهار للوجستيات | خبرة تتجاوز 40 عاماً في التخليص الجمركي",
    ),
    seo_description: localize(
      "Founded in 1982 by Mr. Omer Al-Natour, Al-Izdehar Logistics builds on more than four decades of customs clearance experience to deliver integrated logistics solutions.",
      "تأسست الإزدهار للوجستيات عام 1982 على يد السيد عمر الناطور، وتبني على خبرة تتجاوز أربعة عقود في التخليص الجمركي لتقديم حلول لوجستية متكاملة.",
    ),
    focus_keyword: localize("About Al-Izdehar Logistics", "عن الإزدهار للوجستيات"),
    canonical_url: null,
    noindex: false,
    og_title: null,
    og_description: null,
    og_image: null,
    schema_type: "AboutPage",
  },
};
