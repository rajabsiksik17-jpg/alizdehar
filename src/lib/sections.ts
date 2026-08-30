import "server-only";
import type { SectionData } from "@/components/sections";
import {
  getServices,
  getWhyUs,
  getStatistics,
  getTestimonials,
  getClients,
  getGallery,
} from "@/lib/content";

/** Aggregated data used across section renderers. */
export async function loadSectionData(): Promise<SectionData> {
  const [services, whyUs, statistics, testimonials, clients, gallery] =
    await Promise.all([
      getServices(),
      getWhyUs(),
      getStatistics(),
      getTestimonials(),
      getClients(),
      getGallery(),
    ]);

  // Homepage FAQ = the first question from each service (curated).
  const faq = services.flatMap((s) => s.faq.slice(0, 1));

  return { services, whyUs, statistics, testimonials, clients, gallery, faq };
}
