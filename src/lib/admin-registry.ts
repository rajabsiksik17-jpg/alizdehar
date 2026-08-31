import "server-only";

export type FieldType = "text" | "textarea" | "boolean" | "number" | "localized" | "json";

export interface AdminField {
  name: string;
  label: string;
  labelAr: string;
  type: FieldType;
  required?: boolean;
}

export interface AdminEntity {
  table: string;
  label: string;
  labelAr: string;
  singular: string;
  singularAr: string;
  orderBy: string;
  orderAsc?: boolean;
  fields: AdminField[];
}

/**
 * Whitelist of CMS tables editable from the Admin via the generic CRUD API.
 * Only these tables are accepted — the API rejects anything else.
 */
export const adminEntities: AdminEntity[] = [
  {
    table: "social_links",
    label: "Social Media",
    labelAr: "وسائل التواصل",
    singular: "Platform",
    singularAr: "منصة",
    orderBy: "sort_order",
    fields: [
      { name: "platform", label: "Platform", labelAr: "المنصة", type: "text", required: true },
      { name: "label", label: "Label", labelAr: "التسمية", type: "text" },
      { name: "icon", label: "Icon", labelAr: "الأيقونة", type: "text" },
      { name: "url", label: "URL", labelAr: "الرابط", type: "text" },
      { name: "enabled", label: "Enabled", labelAr: "مفعّل", type: "boolean" },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
    ],
  },
  {
    table: "statistics",
    label: "Statistics",
    labelAr: "الإحصائيات",
    singular: "Statistic",
    singularAr: "إحصائية",
    orderBy: "sort_order",
    fields: [
      { name: "value", label: "Value", labelAr: "القيمة", type: "text", required: true },
      { name: "suffix", label: "Suffix", labelAr: "اللاحقة", type: "text" },
      { name: "label", label: "Label", labelAr: "التسمية", type: "localized", required: true },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
      { name: "enabled", label: "Enabled", labelAr: "مفعّل", type: "boolean" },
    ],
  },
  {
    table: "why_us",
    label: "Why Al-Izdehar",
    labelAr: "لماذا الازدهار",
    singular: "Item",
    singularAr: "عنصر",
    orderBy: "sort_order",
    fields: [
      { name: "icon", label: "Icon", labelAr: "الأيقونة", type: "text" },
      { name: "title", label: "Title", labelAr: "العنوان", type: "localized", required: true },
      { name: "description", label: "Description", labelAr: "الوصف", type: "localized" },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
      { name: "enabled", label: "Enabled", labelAr: "مفعّل", type: "boolean" },
    ],
  },
  {
    table: "testimonials",
    label: "Testimonials",
    labelAr: "آراء العملاء",
    singular: "Testimonial",
    singularAr: "رأي",
    orderBy: "sort_order",
    fields: [
      { name: "client_name", label: "Client name", labelAr: "اسم العميل", type: "localized", required: true },
      { name: "company", label: "Company", labelAr: "الشركة", type: "localized" },
      { name: "position", label: "Position", labelAr: "المنصب", type: "localized" },
      { name: "quote", label: "Quote", labelAr: "النص", type: "localized" },
      { name: "rating", label: "Rating", labelAr: "التقييم", type: "number" },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
      { name: "enabled", label: "Enabled", labelAr: "مفعّل", type: "boolean" },
    ],
  },
  {
    table: "clients",
    label: "Clients",
    labelAr: "العملاء",
    singular: "Client",
    singularAr: "عميل",
    orderBy: "sort_order",
    fields: [
      { name: "name", label: "Name", labelAr: "الاسم", type: "text", required: true },
      { name: "url", label: "URL", labelAr: "الرابط", type: "text" },
      { name: "logo", label: "Logo URL", labelAr: "رابط الشعار", type: "text" },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
      { name: "enabled", label: "Enabled", labelAr: "مفعّل", type: "boolean" },
    ],
  },
  {
    table: "gallery",
    label: "Gallery",
    labelAr: "المعرض",
    singular: "Image",
    singularAr: "صورة",
    orderBy: "sort_order",
    fields: [
      { name: "src", label: "Image URL", labelAr: "رابط الصورة", type: "text", required: true },
      { name: "alt", label: "Alt text", labelAr: "النص البديل", type: "localized" },
      { name: "category", label: "Category", labelAr: "التصنيف", type: "text" },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
    ],
  },
  {
    table: "redirects",
    label: "Redirects",
    labelAr: "التحويلات",
    singular: "Redirect",
    singularAr: "تحويل",
    orderBy: "from_path",
    fields: [
      { name: "from_path", label: "From path", labelAr: "من المسار", type: "text", required: true },
      { name: "to_path", label: "To path", labelAr: "إلى المسار", type: "text", required: true },
      { name: "status", label: "Status code", labelAr: "رمز الحالة", type: "number" },
    ],
  },
  {
    table: "cargo_types",
    label: "Cargo Types",
    labelAr: "أنواع البضائع",
    singular: "Cargo type",
    singularAr: "نوع بضاعة",
    orderBy: "sort_order",
    fields: [
      { name: "label", label: "Label", labelAr: "التسمية", type: "localized", required: true },
      { name: "sort_order", label: "Order", labelAr: "الترتيب", type: "number" },
    ],
  },
];

export function getEntity(table: string): AdminEntity | undefined {
  return adminEntities.find((e) => e.table === table);
}

export const adminEntityTableSet = new Set(adminEntities.map((e) => e.table));
