import type {
  BlogPost,
  Career,
  ClientLogo,
  GalleryItem,
  Testimonial,
} from "@/types";

/*
 * Social-proof and editorial content.
 * Intentionally empty — the source document contains no testimonials,
 * client logos, blog posts, careers or gallery items, and we must not
 * invent any. Everything here is populated from the CMS.
 */

export const seedTestimonials: Testimonial[] = [];
export const seedClients: ClientLogo[] = [];
export const seedBlogPosts: BlogPost[] = [];
export const seedCareers: Career[] = [];
export const seedGallery: GalleryItem[] = [];
