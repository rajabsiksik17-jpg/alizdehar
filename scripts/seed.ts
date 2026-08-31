/**
 * Seed script — pushes the bundled content (from src/content) into Supabase.
 *
 * Usage:
 *   1. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. Run the schema (supabase/schema.sql) in the Supabase SQL editor
 *   3. npm run seed
 *
 * This resets and re-inserts the seed content for the managed tables.
 */
import { createClient } from "@supabase/supabase-js";
import { seedSettings, seedMenu } from "@/content/settings";
import { seedServices } from "@/content/services";
import { homePage, seedWhyUs, seedStatistics } from "@/content/home";
import { aboutPage } from "@/content/about";
import { seedCareers, seedCargoTypes } from "@/content/misc";

function loadEnv() {
  // Node 20.12+ helper — loads .env.local if present.
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

async function reset(table: string) {
  const { error } = await admin.from(table).delete().neq("id", ALL);
  if (error) {
    // Some tables use integer/text PKs; fall back to upsert-only.
    console.warn(`  (reset ${table} skipped: ${error.message})`);
  }
}

function stripId<T extends { id?: unknown }>(row: T): Omit<T, "id"> {
  const copy = { ...row };
  delete copy.id;
  return copy;
}

async function main() {
  console.log("Seeding Al-Izdehar Logistics…\n");

  // 1. Settings (single row, id = 1)
  await admin.from("settings").upsert(
    { ...seedSettings, id: 1 },
    { onConflict: "id" },
  );
  console.log("✓ settings");

  // 2. Menu (flatten parent/children)
  await reset("menu_items");
  for (const parent of seedMenu) {
    const { data: inserted } = await admin
      .from("menu_items")
      .insert(stripId(parent))
      .select("id")
      .single();
    if (parent.children.length && inserted) {
      const children = parent.children.map((c) => ({
        ...stripId(c),
        parent_id: inserted.id,
      }));
      await admin.from("menu_items").insert(children);
    }
  }
  console.log("✓ menu_items");

  // 3. Services
  await reset("services");
  const serviceRows = seedServices.map(stripId);
  await admin.from("services").insert(serviceRows);
  console.log(`✓ services (${serviceRows.length})`);

  // 4. Pages + sections
  await reset("page_sections");
  await reset("pages");
  for (const page of [homePage, aboutPage]) {
    const { sections, ...pageRow } = page;
    const { data: insertedPage } = await admin
      .from("pages")
      .insert(pageRow)
      .select("id")
      .single();
    if (insertedPage && sections.length) {
      const sectionRows = sections.map((s, i) => ({
        ...stripId(s),
        page_id: insertedPage.id,
        sort_order: i + 1,
      }));
      await admin.from("page_sections").insert(sectionRows);
    }
  }
  console.log("✓ pages + sections (home, about)");

  // 5. Global blocks
  await reset("why_us");
  await admin.from("why_us").insert(seedWhyUs.map(stripId));
  console.log("✓ why_us");

  await reset("statistics");
  await admin.from("statistics").insert(seedStatistics.map(stripId));
  console.log("✓ statistics");

  await reset("careers");
  await admin.from("careers").insert(seedCareers.map(stripId));
  console.log(`✓ careers (${seedCareers.length} — demo)`);

  await reset("cargo_types");
  await admin.from("cargo_types").insert(
    seedCargoTypes.map((label, i) => ({ label, sort_order: i + 1 })),
  );
  console.log(`✓ cargo_types (${seedCargoTypes.length})`);

  console.log("\nSeed complete. The public site will now read from Supabase.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
