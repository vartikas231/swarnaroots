import { db } from "@/src/lib/db";

export interface PersistedStorefrontSettings {
  media?: {
    heroMediaUrls?: string[];
    reviewMediaUrls?: string[];
  };
  paymentVisibility?: {
    visibleMethods?: Array<"upi" | "card" | "cod">;
  };
}

const STOREFRONT_SETTINGS_KEY = "storefront_settings";

function normalizeUrls(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set<string>();
  return values
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .filter((item) => {
      if (!/^https?:\/\//i.test(item) || seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    })
    .slice(0, 8);
}

function normalizeMethods(values: unknown) {
  const allowed = new Set(["upi", "card", "cod"]);
  if (!Array.isArray(values)) {
    return ["cod"] as Array<"upi" | "card" | "cod">;
  }

  const next = values.filter(
    (item): item is "upi" | "card" | "cod" =>
      typeof item === "string" && allowed.has(item),
  );

  return next.length ? next : (["cod"] as Array<"upi" | "card" | "cod">);
}

export async function getPersistedStorefrontSettings(): Promise<PersistedStorefrontSettings> {
  const record = await db.setting.findUnique({
    where: { key: STOREFRONT_SETTINGS_KEY },
    select: { value: true },
  });

  if (!record?.value) {
    return {};
  }

  try {
    const parsed = JSON.parse(record.value) as PersistedStorefrontSettings;
    return {
      media: {
        heroMediaUrls: normalizeUrls(parsed.media?.heroMediaUrls),
        reviewMediaUrls: normalizeUrls(parsed.media?.reviewMediaUrls),
      },
      paymentVisibility: {
        visibleMethods: normalizeMethods(parsed.paymentVisibility?.visibleMethods),
      },
    };
  } catch {
    return {};
  }
}

export async function savePersistedStorefrontSettings(
  payload: PersistedStorefrontSettings,
) {
  const nextPayload: PersistedStorefrontSettings = {
    media: {
      heroMediaUrls: normalizeUrls(payload.media?.heroMediaUrls),
      reviewMediaUrls: normalizeUrls(payload.media?.reviewMediaUrls),
    },
    paymentVisibility: {
      visibleMethods: normalizeMethods(payload.paymentVisibility?.visibleMethods),
    },
  };

  const saved = await db.setting.upsert({
    where: { key: STOREFRONT_SETTINGS_KEY },
    update: {
      value: JSON.stringify(nextPayload),
      type: "json",
      category: "storefront",
    },
    create: {
      key: STOREFRONT_SETTINGS_KEY,
      value: JSON.stringify(nextPayload),
      type: "json",
      category: "storefront",
    },
  });

  return {
    key: saved.key,
    ...nextPayload,
  };
}
