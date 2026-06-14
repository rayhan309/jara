import { cache } from "react";
import { unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { DEFAULT_SETTINGS, normalizeSettings, SETTINGS_ID } from "@/lib/siteSettings";

const COLLECTION = "site_settings";

async function readSiteSettingsFromDb() {
  const collection = await dbConnect(COLLECTION);
  const doc = await collection.findOne({ _id: SETTINGS_ID });
  return normalizeSettings(doc || DEFAULT_SETTINGS);
}

const getCachedSiteSettings = unstable_cache(
  readSiteSettingsFromDb,
  ["site-settings-global"],
  { revalidate: 60, tags: ["site-settings"] }
);

export const getSiteSettings = cache(async () => {
  try {
    return await getCachedSiteSettings();
  } catch (error) {
    console.error("getSiteSettings error:", error);
    return normalizeSettings(DEFAULT_SETTINGS);
  }
});

/** Bypass cache — use after settings update or for credential checks */
export async function getFreshSiteSettings() {
  try {
    return await readSiteSettingsFromDb();
  } catch (error) {
    console.error("getFreshSiteSettings error:", error);
    return normalizeSettings(DEFAULT_SETTINGS);
  }
}
