import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  const allSettings = await getCollection("settings");
  const userSettings = allSettings[0]?.data || {};

  const manifest = {
    name: userSettings.siteName,
    short_name: userSettings.siteName,
    description: userSettings.siteDescription,
    icons: [
      {
        src: userSettings.favicons?.icon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: userSettings.favicons?.appleTouchIcon,
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: userSettings.favicons?.mainIcon,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    theme_color: userSettings.themeSettings?.colors?.primary || "#6B7280",
    background_color: userSettings.themeSettings?.colors?.bgPrimary || "#FFF8F0",
    display: "standalone",
    start_url: "/",
    scope: "/",
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
};
