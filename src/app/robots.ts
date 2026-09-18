import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://botclips.online";

  return {
    rules: [
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "Bingbot",
          "Googlebot",
          "*",
        ],
        allow: [
          "/",
          "/maintenance",
          "/login",
          "/signup",
          "/llms.txt",
          "/llms-full.txt",
          "/sitemap.xml",
        ],
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
