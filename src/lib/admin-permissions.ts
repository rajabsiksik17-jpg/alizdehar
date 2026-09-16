import type { AdminRole } from "@/lib/admin-auth";

export type Action = "view" | "create" | "edit" | "delete" | "publish" | "manage";

export type Module =
  | "dashboard"
  | "pages"
  | "services"
  | "blog"
  | "media"
  | "forms"
  | "quotes"
  | "contacts"
  | "careers"
  | "applications"
  | "menus"
  | "social"
  | "seo"
  | "email"
  | "settings"
  | "users"
  | "notifications"
  | "audit";

export interface ModuleDef {
  key: Module;
  label: { en: string; ar: string };
  actions: Action[];
}

export const MODULES: ModuleDef[] = [
  { key: "dashboard", label: { en: "Dashboard", ar: "لوحة التحكم" }, actions: ["view"] },
  { key: "pages", label: { en: "Pages", ar: "الصفحات" }, actions: ["view", "create", "edit", "delete", "publish", "manage"] },
  { key: "services", label: { en: "Services", ar: "الخدمات" }, actions: ["view", "create", "edit", "delete", "publish", "manage"] },
  { key: "blog", label: { en: "Blog", ar: "المدونة" }, actions: ["view", "create", "edit", "delete", "publish", "manage"] },
  { key: "media", label: { en: "Media", ar: "الوسائط" }, actions: ["view", "create", "edit", "delete", "manage"] },
  { key: "forms", label: { en: "Forms", ar: "النماذج" }, actions: ["view", "create", "edit", "delete", "manage"] },
  { key: "quotes", label: { en: "Quote Requests", ar: "طلبات عرض السعر" }, actions: ["view", "edit", "delete", "manage"] },
  { key: "contacts", label: { en: "Contact Messages", ar: "رسائل التواصل" }, actions: ["view", "edit", "delete", "manage"] },
  { key: "careers", label: { en: "Careers", ar: "الوظائف" }, actions: ["view", "create", "edit", "delete", "publish", "manage"] },
  { key: "applications", label: { en: "Job Applications", ar: "طلبات الوظائف" }, actions: ["view", "edit", "delete", "manage"] },
  { key: "menus", label: { en: "Menus", ar: "القوائم" }, actions: ["view", "create", "edit", "delete", "manage"] },
  { key: "social", label: { en: "Social Media", ar: "وسائل التواصل" }, actions: ["view", "create", "edit", "delete", "manage"] },
  { key: "seo", label: { en: "SEO", ar: "SEO" }, actions: ["view", "edit", "manage"] },
  { key: "email", label: { en: "Email", ar: "البريد الإلكتروني" }, actions: ["view", "edit", "manage"] },
  { key: "settings", label: { en: "Settings", ar: "الإعدادات" }, actions: ["view", "edit", "manage"] },
  { key: "users", label: { en: "Users", ar: "المستخدمون" }, actions: ["view", "create", "edit", "delete", "manage"] },
  { key: "notifications", label: { en: "Notifications", ar: "الإشعارات" }, actions: ["view", "manage"] },
  { key: "audit", label: { en: "Audit Logs", ar: "سجلات التدقيق" }, actions: ["view", "manage"] },
];

export const ALL_MODULE_KEYS = MODULES.map((m) => m.key);
export const ALL_ACTIONS: Action[] = ["view", "create", "edit", "delete", "publish", "manage"];

export const ACTION_LABELS: Record<Action, { en: string; ar: string }> = {
  view: { en: "View", ar: "عرض" },
  create: { en: "Create", ar: "إنشاء" },
  edit: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
  publish: { en: "Publish", ar: "نشر" },
  manage: { en: "Manage", ar: "إدارة" },
};

/** module key -> allowed actions */
export type PermissionGrants = Record<string, Action[]>;

const g = (actions: Action[]): Action[] => actions;

/** Built-in role → default grants. */
export const BUILTIN_ROLES: Record<AdminRole, { label: { en: string; ar: string }; grants: PermissionGrants }> = {
  super_admin: { label: { en: "Super Admin", ar: "مدير عام" }, grants: {} },
  admin: {
    label: { en: "Admin", ar: "مدير" },
    grants: {
      dashboard: g(["view"]),
      pages: g(["manage"]),
      services: g(["manage"]),
      blog: g(["manage"]),
      media: g(["manage"]),
      forms: g(["manage"]),
      quotes: g(["manage"]),
      contacts: g(["manage"]),
      careers: g(["manage"]),
      applications: g(["manage"]),
      menus: g(["manage"]),
      social: g(["manage"]),
      seo: g(["manage"]),
      email: g(["manage"]),
      settings: g(["manage"]),
      notifications: g(["manage"]),
      audit: g(["view"]),
    },
  },
  content_manager: {
    label: { en: "Content Manager", ar: "مدير محتوى" },
    grants: {
      dashboard: g(["view"]),
      pages: g(["manage"]),
      services: g(["manage"]),
      blog: g(["manage"]),
      media: g(["manage"]),
      forms: g(["manage"]),
      menus: g(["manage"]),
      careers: g(["manage"]),
      quotes: g(["view"]),
      contacts: g(["view"]),
      applications: g(["view"]),
      notifications: g(["view"]),
    },
  },
  seo_manager: {
    label: { en: "SEO Manager", ar: "مدير SEO" },
    grants: {
      dashboard: g(["view"]),
      seo: g(["manage"]),
      social: g(["manage"]),
      blog: g(["edit"]),
      notifications: g(["view"]),
    },
  },
  editor: {
    label: { en: "Editor", ar: "محرر" },
    grants: {
      dashboard: g(["view"]),
      pages: g(["view", "create", "edit"]),
      services: g(["view", "create", "edit"]),
      blog: g(["view", "create", "edit"]),
      media: g(["view", "create"]),
      forms: g(["view", "create", "edit"]),
      menus: g(["view", "create", "edit"]),
      careers: g(["view", "create", "edit"]),
      notifications: g(["view"]),
    },
  },
};

export const ROLE_LABELS: Record<AdminRole, { en: string; ar: string }> = {
  super_admin: BUILTIN_ROLES.super_admin.label,
  admin: BUILTIN_ROLES.admin.label,
  content_manager: BUILTIN_ROLES.content_manager.label,
  seo_manager: BUILTIN_ROLES.seo_manager.label,
  editor: BUILTIN_ROLES.editor.label,
};

export const BUILTIN_ROLE_KEYS = Object.keys(BUILTIN_ROLES) as AdminRole[];

/** Every module granted "manage" (full access). */
export function fullAccess(): PermissionGrants {
  const out: PermissionGrants = {};
  for (const m of ALL_MODULE_KEYS) out[m] = ["manage"];
  return out;
}

export function isSuperAdminRole(role: string): boolean {
  return role === "super_admin";
}

export function mergeGrants(base: PermissionGrants, override?: PermissionGrants | null): PermissionGrants {
  const out: PermissionGrants = { ...base };
  if (override) {
    for (const [mod, actions] of Object.entries(override)) {
      out[mod] = actions && actions.length ? actions : [];
    }
  }
  return out;
}

/**
 * Resolve effective grants for a user given their role, an optional custom-role
 * grant set (from the roles table), and an optional per-user override.
 */
export function resolveGrants(input: {
  role: string;
  customRoleGrants?: PermissionGrants | null;
  profilePermissions?: PermissionGrants | null;
}): PermissionGrants {
  if (isSuperAdminRole(input.role)) return fullAccess();
  const base =
    input.customRoleGrants ??
    BUILTIN_ROLES[input.role as AdminRole]?.grants ??
    {};
  return mergeGrants(base, input.profilePermissions);
}

export function hasAction(grants: PermissionGrants, module: Module, action: Action = "view"): boolean {
  const allowed = grants[module] ?? [];
  if (allowed.includes("manage")) return true;
  if (action === "manage") return false;
  return allowed.includes(action);
}

/* ── Coarse group → modules (backward compatibility) ───────── */

export type Permission = "dashboard" | "content" | "leads" | "seo" | "settings" | "users";

const GROUP_MODULES: Record<Permission, Module[]> = {
  dashboard: ["dashboard"],
  content: ["pages", "services", "blog", "media", "forms", "menus", "careers"],
  leads: ["quotes", "contacts", "applications"],
  seo: ["seo", "social"],
  settings: ["settings", "email"],
  users: ["users"],
};

/** True if the user can access (view) at least one module in the coarse group. */
export function hasGroupAccess(grants: PermissionGrants, group: Permission): boolean {
  const mods = GROUP_MODULES[group];
  return mods.some((m) => hasAction(grants, m, "view"));
}

/** Map a module key to its coarse permission group (used by legacy call sites). */
export function permissionForModuleSlug(slug: string): Permission | null {
  switch (slug) {
    case "seo":
    case "social":
    case "redirects":
      return "seo";
    case "email":
    case "smtp":
    case "imap":
      return "settings";
    case "users":
      return "users";
    case "leads":
    case "notifications":
      return "leads";
    default:
      return null;
  }
}

/** Map a CRUD table name to a coarse permission group. */
export function permissionForTable(table: string): Permission {
  if (table === "social_links" || table === "redirects") return "seo";
  return "content";
}

/** Coarse groups the user can access (for sidebar filtering). */
export function groupsForGrants(grants: PermissionGrants): Permission[] {
  return (Object.keys(GROUP_MODULES) as Permission[]).filter((g) => hasGroupAccess(grants, g));
}
