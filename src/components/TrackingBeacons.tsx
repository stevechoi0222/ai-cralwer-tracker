"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/src/lib/site.config";

export default function TrackingBeacons() {
  const pathname = usePathname();
  const page = pathname || "/";

  // Build tracking URL parameters
  const params = new URLSearchParams({
    token: siteConfig.worker.token,
    page: page,
  });

  const pixelUrl = `${siteConfig.worker.endpoint}/pixel.gif?${params.toString()}`;
  const cssUrl = `${siteConfig.worker.endpoint}/log.css?${params.toString()}`;

  return (
    <>
      {/* Method 1: 1x1 Pixel Image Beacon */}
      <img
        src={pixelUrl}
        width="1"
        height="1"
        alt=""
        referrerPolicy="origin-when-cross-origin"
        style={{ position: "absolute", left: -9999, top: -9999 }}
      />

      {/* Method 2: CSS Link Beacon */}
      <link
        rel="stylesheet"
        href={cssUrl}
        referrerPolicy="origin-when-cross-origin"
      />

      {/* Method 3: JavaScript Pixel Beacon */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try {
                var p = new Image();
                var params = new URLSearchParams({
                  token: '${siteConfig.worker.token}',
                  page: '${page}',
                  ts: Date.now()
                });
                p.src = '${siteConfig.worker.endpoint}/pixel.gif?' + params.toString();
                p.style.position = 'absolute';
                p.style.left = '-9999px';
                p.style.top = '-9999px';
                p.style.width = '1px';
                p.style.height = '1px';
              } catch(e) {}
            })();
          `,
        }}
      />

      {/* Data token attribute (from original HTML) */}
      <div
        data-token={siteConfig.worker.token}
        style={{ display: "none" }}
      />
    </>
  );
}
