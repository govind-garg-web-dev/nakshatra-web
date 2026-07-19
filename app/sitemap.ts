import type { MetadataRoute } from "next";
import { SIGN_SLUGS } from "@/lib/astro/constants";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/kundli",
  "/compatibility",
  "/compatibility/human",
  "/compatibility/psychology",
  "/timing",
  "/chat",
  "/career-timing",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const horoscopeEntries: MetadataRoute.Sitemap = Object.values(SIGN_SLUGS).map((slug) => ({
    url: `${baseUrl}/horoscope/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...horoscopeEntries];
}
