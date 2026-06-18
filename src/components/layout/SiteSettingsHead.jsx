import { getHeroBannerPreloadUrls } from "@/lib/heroBanners";
import { getFaviconUrl, getThemeInlineCss } from "@/lib/siteSettings";

export default function SiteSettingsHead({ settings }) {
  const themeCss = getThemeInlineCss(settings);
  const bannerUrls = getHeroBannerPreloadUrls(settings.heroBanners, 2);
  const faviconUrl = getFaviconUrl(settings);

  return (
    <>
      {themeCss ? (
        <style
          id="store-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      ) : null}
      {faviconUrl ? (
        <>
          <link rel="icon" href={faviconUrl} />
          <link rel="apple-touch-icon" href={faviconUrl} />
        </>
      ) : null}
      {bannerUrls.map((url, index) => (
        <link
          key={url}
          rel="preload"
          as="image"
          href={url}
          {...(index === 0 ? { fetchPriority: "high" } : {})}
        />
      ))}
    </>
  );
}
