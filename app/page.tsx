import type { Metadata } from "next";
import { HomePageClient } from "@/app/components/home-page-client";
import { siteConfig } from "@/app/config/site";
import { toAbsoluteUrl } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Modern Ayurveda Luxury",
  description: siteConfig.brand.metaDescription,
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "en-US": "/",
      "x-default": "/",
    },
  },
  keywords: [
    "modern ayurveda",
    "premium herbal store",
    "himachal herbs",
    "natural wellness products",
  ],
};

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: siteConfig.brand.name,
    url: toAbsoluteUrl("/"),
    description: siteConfig.brand.metaDescription,
    sameAs: [
      siteConfig.social.instagramUrl,
      siteConfig.social.linkedinUrl,
      siteConfig.social.facebookUrl,
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${siteConfig.support.whatsappNumber}`,
        contactType: "customer service",
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brand.name,
    url: toAbsoluteUrl("/"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
        }}
      />
      <HomePageClient />
    </>
  );
}
