import { localize, type LocalizedText } from "@/lib/i18n/config";

export type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "country"
  | "textarea"
  | "select"
  | "number"
  | "url"
  | "date"
  | "file";

export interface FormFieldDef {
  id?: string;
  name: string;
  type: FormFieldType;
  label: LocalizedText;
  placeholder?: LocalizedText | null;
  help_text?: LocalizedText | null;
  required: boolean;
  options?: { value: string; label: LocalizedText }[];
  sort_order: number;
}

export interface FormDef {
  id?: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText | null;
  is_default: boolean;
  entity: string;
  fields: FormFieldDef[];
}

export const FIELD_TYPE_LABELS: Record<FormFieldType, { en: string; ar: string }> = {
  text: { en: "Text", ar: "نص" },
  email: { en: "Email", ar: "بريد إلكتروني" },
  phone: { en: "Phone", ar: "هاتف" },
  country: { en: "Country", ar: "الدولة" },
  textarea: { en: "Long text", ar: "نص طويل" },
  select: { en: "Dropdown", ar: "قائمة منسدلة" },
  number: { en: "Number", ar: "رقم" },
  url: { en: "URL", ar: "رابط" },
  date: { en: "Date", ar: "تاريخ" },
  file: { en: "File upload", ar: "رفع ملف" },
};

export const DEFAULT_APPLICATION_FORM: FormDef = {
  slug: "default-job-application",
  name: localize("Default Application Form", "نموذج التقديم الافتراضي"),
  description: localize(
    "The standard application form used across all vacancies.",
    "نموذج التقديم القياسي المستخدم في جميع الوظائف.",
  ),
  is_default: true,
  entity: "application",
  fields: [
    { name: "name", type: "text", label: localize("Full name", "الاسم الكامل"), required: true, sort_order: 1 },
    { name: "email", type: "email", label: localize("Email", "البريد الإلكتروني"), required: true, sort_order: 2 },
    { name: "phone", type: "phone", label: localize("Phone", "الهاتف"), required: true, sort_order: 3 },
    { name: "country", type: "country", label: localize("Country", "الدولة"), required: false, sort_order: 4 },
    { name: "linkedin", type: "url", label: localize("LinkedIn profile", "حساب LinkedIn"), required: false, sort_order: 5 },
    { name: "experience", type: "number", label: localize("Years of experience", "سنوات الخبرة"), required: false, sort_order: 6 },
    { name: "message", type: "textarea", label: localize("Cover message", "رسالة التقديم"), required: false, sort_order: 7 },
    { name: "cv", type: "file", label: localize("CV / Resume", "السيرة الذاتية"), required: true, sort_order: 8 },
  ],
};
