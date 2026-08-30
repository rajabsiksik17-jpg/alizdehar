import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Al-Izdehar Logistics",
    short_name: "Al-Izdehar",
    description: "Integrated shipping and logistics solutions since 1982.",
    start_url: "/",
    display: "standalone",
    background_color: "#081c33",
    theme_color: "#0f2a48",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
