import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://skillssense.com";
  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-04-18"),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
