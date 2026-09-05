/**
 * Seed script — pushes the bundled content (from src/content) into Supabase.
 *
 * Usage:
 *   1. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. Run the schema (supabase/schema.sql) in the Supabase SQL editor
 *   3. npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { seedSettings, seedMenu } from "@/content/settings";
import { seedServices } from "@/content/services";
import { homePage, seedWhyUs, seedStatistics } from "@/content/home";
import { aboutPage } from "@/content/about";
import { seedCareers, seedCargoTypes } from "@/content/misc";
import { DEFAULT_APPLICATION_FORM } from "@/lib/job-forms";

function loadEnv() {
  const load = (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile;
  if (load) {
    try {
      load(".env.local");
    } catch {
      // ignore
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ALL = "00000000-0000-0000-0000-000000000000";

/** Remove keys that are not database columns. */
function strip<T extends Record<string, unknown>>(row: T, keys: string[]): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...row };
  keys.forEach((k) => delete copy[k]);
  return copy;
}

function check(label: string, error: { message?: string } | null) {
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    throw new Error(`${label}: ${error.message}`);
  }
  console.log(`✓ ${label}`);
}

async function reset(table: string) {
  const { error } = await admin.from(table).delete().neq("id", ALL);
  if (error) console.warn(`  (reset ${table} skipped: ${error.message})`);
}

async function main() {
  console.log("Seeding Al-Izdehar Logistics…\n");

  // 1. Settings (single row, id = 1) — strip fields that may not exist as columns.
  const settingsRow = strip(seedSettings as unknown as Record<string, unknown>, [
    "social_links",
    "maintenance_mode",
  ]);
  const { error: settingsErr } = await admin
    .from("settings")
    .upsert({ ...settingsRow, id: 1 }, { onConflict: "id" });
  check("settings", settingsErr);

  // 2. Social links (separate table).
  await reset("social_links");
  const socialRows = (seedSettings.social_links || []).map((s) =>
    strip(s as unknown as Record<string, unknown>, ["id"]),
  );
  if (socialRows.length) {
    const { error: socialErr } = await admin.from("social_links").insert(socialRows);
    check(`social_links (${socialRows.length})`, socialErr);
  }

  // 3. Menu (flatten parent/children).
  await reset("menu_items");
  for (const parent of seedMenu) {
    const parentRow = strip(parent as unknown as Record<string, unknown>, ["id", "children"]);
    const { data: inserted, error: parentErr } = await admin
      .from("menu_items")
      .insert(parentRow)
      .select("id")
      .single();
    check(`menu item "${parentRow.url}"`, parentErr);
    if (parent.children.length && inserted) {
      const childRows = parent.children.map((c) => ({
        ...strip(c as unknown as Record<string, unknown>, ["id", "children"]),
        parent_id: inserted.id,
      }));
      const { error: childErr } = await admin.from("menu_items").insert(childRows);
      check(`menu children (${childRows.length})`, childErr);
    }
  }

  // 4. Services.
  await reset("services");
  const serviceRows = seedServices.map((s) => strip(s as unknown as Record<string, unknown>, ["id"]));
  const { error: servicesErr } = await admin.from("services").insert(serviceRows);
  check(`services (${serviceRows.length})`, servicesErr);

  // 5. Pages + sections.
  await reset("page_sections");
  await reset("pages");
  for (const page of [homePage, aboutPage]) {
    const pageRow = strip(page as unknown as Record<string, unknown>, ["id", "sections"]);
    const { data: insertedPage, error: pageErr } = await admin
      .from("pages")
      .insert(pageRow)
      .select("id")
      .single();
    check(`page "${pageRow.slug}"`, pageErr);
    if (insertedPage && page.sections.length) {
      const sectionRows = page.sections.map((s, i) => ({
        ...strip(s as unknown as Record<string, unknown>, ["id"]),
        page_id: insertedPage.id,
        sort_order: i + 1,
      }));
      const { error: secErr } = await admin.from("page_sections").insert(sectionRows);
      check(`sections for "${pageRow.slug}" (${sectionRows.length})`, secErr);
    }
  }

  // 6. Global blocks.
  await reset("why_us");
  const { error: whyErr } = await admin.from("why_us").insert(seedWhyUs.map((w) => strip(w as unknown as Record<string, unknown>, ["id"])));
  check("why_us", whyErr);

  await reset("statistics");
  const { error: statErr } = await admin.from("statistics").insert(seedStatistics.map((s) => strip(s as unknown as Record<string, unknown>, ["id"])));
  check("statistics", statErr);

  await reset("careers");
  const { error: careersErr } = await admin.from("careers").insert(seedCareers.map((c) => strip(c as unknown as Record<string, unknown>, ["id"])));
  check(`careers (${seedCareers.length} — demo)`, careersErr);

  await reset("cargo_types");
  const { error: cargoErr } = await admin.from("cargo_types").insert(
    seedCargoTypes.map((label, i) => ({ label, sort_order: i + 1 })),
  );
  check(`cargo_types (${seedCargoTypes.length})`, cargoErr);

  // 7. Default job application form (if not already present).
  const { data: existingDefault } = await admin
    .from("forms")
    .select("id")
    .eq("slug", DEFAULT_APPLICATION_FORM.slug)
    .maybeSingle();
  if (!existingDefault) {
    const { data: formRow, error: formErr } = await admin
      .from("forms")
      .insert({
        slug: DEFAULT_APPLICATION_FORM.slug,
        name: DEFAULT_APPLICATION_FORM.name,
        description: DEFAULT_APPLICATION_FORM.description,
        is_default: true,
        entity: "application",
      })
      .select("id")
      .single();
    check("default application form", formErr);
    if (formRow) {
      const fieldRows = DEFAULT_APPLICATION_FORM.fields.map((f, i) => ({
        form_id: formRow.id,
        name: f.name,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder ?? null,
        help_text: f.help_text ?? null,
        required: f.required,
        options: f.options ?? [],
        sort_order: i + 1,
      }));
      const { error: fieldsErr } = await admin.from("form_fields").insert(fieldRows);
      check(`default form fields (${fieldRows.length})`, fieldsErr);
    }
  } else {
    console.log("✓ default application form (already exists)");
  }

  console.log("\nSeed complete. The public site will now read from Supabase.");
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
