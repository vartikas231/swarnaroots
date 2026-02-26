import { siteConfig } from "@/app/config/site";

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "";

  const source = envUrl || siteConfig.brand.siteUrl;
  return normalizeUrl(source);
}

export function toAbsoluteUrl(path = "/") {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function getMetadataBase() {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL("https://swarnaroots.com");
  }
}
