import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/join", "/squad", "/matches", "/results", "/gallery"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://morningfootball.com/sitemap.xml",
  };
}
