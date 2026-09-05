import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  const icon = settings.favicon || "/icon.svg";
  const iconType = settings.favicon ? undefined : "image/svg+xml";

  return {
    name: settings.site_name.en,
    short_name: "Al-Izdehar",
    description: settings.site_description.en,
    start_url: "/",
    display: "standalone",
    background_color: "#081c33",
    theme_color: "#0f2a48",
    icons: [
      {
        src: icon,
        sizes: "any",
        type: iconType,
      },
    ],
  };
}
