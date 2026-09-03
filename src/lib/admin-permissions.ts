import type { AdminRole } from "@/lib/admin-auth";

export type Permission =
  | "dashboard"
  | "content"
  | "leads"
  | "seo"
  | "settings"
  | "users";

/**
 * Role → allowed permissions. Lower roles only get what they need:
 *  - super_admin: everything (incl. user management)
 *  - admin: everything except user management
 *  - content_manager: content + leads
 *  - seo_manager: SEO / marketing only
 *  - editor: content only
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ["dashboard", "content", "leads", "seo", "settings", "users"],
  admin: ["dashboard", "content", "leads", "seo", "settings"],
  content_manager: ["dashboard", "content", "leads"],
  seo_manager: ["dashboard", "seo"],
  editor: ["dashboard", "content"],
};

export const ROLE_LABELS: Record<AdminRole, { en: string; ar: string }> = {
  super_admin: { en: "Super Admin", ar: "مدير عام" },
  admin: { en: "Admin", ar: "مدير" },
  content_manager: { en: "Content Manager", ar: "مدير محتوى" },
  seo_manager: { en: "SEO Manager", ar: "مدير SEO" },
  editor: { en: "Editor", ar: "محرر" },
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as AdminRole[];

export function permissionsFor(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? ["dashboard"];
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}

/** Map a `[...module]` slug to the permission required to manage it. */
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
      return "leads";
    default:
      return null;
  }
}

/** Map a CRUD table name to the permission required to write to it. */
export function permissionForTable(table: string): Permission {
  if (table === "social_links" || table === "redirects") return "seo";
  return "content";
}
