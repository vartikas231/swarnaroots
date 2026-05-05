import type { Metadata } from "next";
import { AuthSessionProvider } from "@/app/components/auth-session-provider";
import { CartProvider } from "@/app/components/cart-provider";
import { StorefrontProvider } from "@/app/components/storefront-provider";
import { siteConfig } from "@/app/config/site";
import { getMetadataBase, toAbsoluteUrl } from "@/app/lib/seo";
import { StoreHeader } from "@/app/components/store-header";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Fraunces, Nunito } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

function resolvePublicUrl(value: string | undefined, fallback: string) {
  const normalized = (value ?? "").trim();
  return normalized || fallback;
}

function resolvePublicValue(value: string | undefined, fallback: string) {
  const normalized = (value ?? "").trim();
  return normalized || fallback;
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${siteConfig.brand.name} | Premium Ayurvedic Herbs`,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.brand.metaDescription,
  applicationName: siteConfig.brand.name,
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "en-US": "/",
      "x-default": "/",
    },
  },
  keywords: [
    "Ayurveda",
    "herbal products",
    "wellness herbs",
    "natural health",
    "Swarna Roots",
    "herbal store India",
    "Himachal tea",
    "wellness candles",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US"],
    url: toAbsoluteUrl("/"),
    siteName: siteConfig.brand.name,
    title: `${siteConfig.brand.name} | Premium Ayurvedic Herbs`,
    description: siteConfig.brand.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brand.name} | Premium Ayurvedic Herbs`,
    description: siteConfig.brand.metaDescription,
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? siteConfig.support.whatsappNumber;
  const whatsappMessage = encodeURIComponent(
    siteConfig.support.whatsappMessage,
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const supportEmail = resolvePublicValue(
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    siteConfig.support.email,
  );
  const supportEmailLink = `mailto:${supportEmail}`;
  const socialConfig = {
    instagramUrl: resolvePublicUrl(
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      siteConfig.social.instagramUrl,
    ),
    linkedinUrl: resolvePublicUrl(
      process.env.NEXT_PUBLIC_LINKEDIN_URL,
      siteConfig.social.linkedinUrl,
    ),
    facebookUrl: resolvePublicUrl(
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
      siteConfig.social.facebookUrl,
    ),
  };
  const socialLinks = [
    {
      href: socialConfig.instagramUrl,
      label: "Instagram",
      icon: Instagram,
    },
    {
      href: socialConfig.linkedinUrl,
      label: "LinkedIn",
      icon: Linkedin,
    },
    {
      href: socialConfig.facebookUrl,
      label: "Facebook",
      icon: Facebook,
    },
  ].filter((item) => /^https?:\/\//i.test(item.href));
  const complianceConfig = {
    fssaiLicenseNumber: resolvePublicValue(
      process.env.NEXT_PUBLIC_FSSAI_LICENSE_NUMBER,
      siteConfig.compliance.fssaiLicenseNumber,
    ),
    certificatePdfUrl: resolvePublicUrl(
      process.env.NEXT_PUBLIC_FSSAI_CERTIFICATE_URL,
      siteConfig.compliance.certificatePdfUrl,
    ),
    verifyLicenseUrl: resolvePublicUrl(
      process.env.NEXT_PUBLIC_FSSAI_VERIFY_URL,
      siteConfig.compliance.verifyLicenseUrl,
    ),
  };
  const hasCertificateLink = /^https?:\/\//i.test(complianceConfig.certificatePdfUrl);
  const hasVerifyLink = /^https?:\/\//i.test(complianceConfig.verifyLicenseUrl);

  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fraunces.variable} antialiased`}>
        <AuthSessionProvider>
          <StorefrontProvider>
            <CartProvider>
              <div className="app-shell">
                <Script id="posthog-init" strategy="afterInteractive">
                  {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="Ei Ni init zi Gi Nr Ui Xi Hi capture calculateEventProperties tn register register_once register_for_session unregister unregister_for_session an getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync ln identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty nn Qi createPersonProfile setInternalOrTestUser sn qi cn opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Ji debug Fr rn getPageViewId captureTraceFeedback captureTraceMetric Bi".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_ruaCxpvacpuWSGtot28LmDKJ2DNek7Rh6hrERQPpEv47',{api_host:'https://us.i.posthog.com',defaults:'2026-01-30',person_profiles:'identified_only'});`}
                </Script>
                <div className="ambient-orb ambient-orb--one" aria-hidden="true" />
                <div className="ambient-orb ambient-orb--two" aria-hidden="true" />
                <StoreHeader />
                <main className="page-shell">{children}</main>
                <footer className="store-footer">
                  <div>
                    <p>{siteConfig.brand.name} | Small-batch herbs. Updated every week.</p>
                    <div className="footer-links">
                      <Link href="/shop">Browse catalog</Link>
                      <Link href="/checkout">Checkout</Link>
                      <a href={supportEmailLink}>Connect over email</a>
                    </div>
                    <details className="footer-compliance">
                      <summary>FSSAI Trust &amp; Compliance</summary>
                      <ul className="footer-compliance-list">
                        <li>
                          <span>FSSAI License Number</span>
                          <strong>{complianceConfig.fssaiLicenseNumber}</strong>
                        </li>
                        <li>
                          {hasCertificateLink ? (
                            <a
                              href={complianceConfig.certificatePdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View FSSAI Certificate (PDF)
                            </a>
                          ) : (
                            <span>FSSAI Certificate link will be updated soon.</span>
                          )}
                        </li>
                        {hasVerifyLink ? (
                          <li>
                            <a
                              href={complianceConfig.verifyLicenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Verify FSSAI License (FoSCoS)
                            </a>
                          </li>
                        ) : null}
                      </ul>
                    </details>
                  </div>
                  <div className="footer-socials">
                    {socialLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer-social-link"
                          aria-label={`Visit ${siteConfig.brand.name} on ${item.label}`}
                        >
                          <Icon size={14} aria-hidden="true" />
                          <span>{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </footer>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-float"
                  aria-label="Chat with Swarna Roots support on WhatsApp"
                >
                  WhatsApp Support
                </a>
              </div>
            </CartProvider>
          </StorefrontProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
