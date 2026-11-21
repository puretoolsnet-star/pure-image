import Script from "next/script";

import { KIXT_GTM_ID, kixtGtmBootstrapScript } from "@/lib/analytics/kixt-gtm";

/** Shared kixt.net GTM — load once from root layout. */
export function KixtGtm() {
  return (
    <Script
      id="kixt-gtm-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: kixtGtmBootstrapScript() }}
    />
  );
}

export function KixtGtmNoScript() {
  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${KIXT_GTM_ID}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}