"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { getMetaPixelIdFromSettings } from "@/lib/siteSettings";
import { META_PIXEL_ID, trackMetaPageView } from "@/lib/metaPixel";

function MetaPixelPageView({ enabled }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    trackMetaPageView();
  }, [pathname, enabled]);

  return null;
}

export default function MetaPixel() {
  const settings = useStoreSettings();
  const pixelId = getMetaPixelIdFromSettings(settings, META_PIXEL_ID);
  const enabled = Boolean(pixelId);

  if (!enabled) return null;

  return (
    <>
      <Script
        key={pixelId}
        id={`meta-pixel-${pixelId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <MetaPixelPageView enabled={enabled} />
    </>
  );
}
