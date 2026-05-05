"use client";

import {
  siteConfig,
  type BrandStyleTokens,
  type ButtonStyle,
  type IconBackgroundMode,
  type IconStrokeWidth,
  type IconTheme,
  type LayoutTokens,
  type RadiusScale,
  type ShapeTheme,
  type ThemeTokens,
} from "@/app/config/site";
import {
  herbCatalog,
  getUniqueCategories,
  starterCategories,
  type HerbProduct,
} from "@/app/data/herbs";
import { mergeStorefrontProductOverrides } from "@/app/lib/storefront-products";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CustomerStory {
  id: string;
  name: string;
  city: string;
  quote: string;
  improvement: string;
}

export interface PaymentRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: string;
  status: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface MarketplaceLinks {
  amazonUrl: string;
  flipkartUrl: string;
}

export interface StorefrontMediaSettings {
  heroMediaUrls: string[];
  reviewMediaUrls: string[];
}

export interface PaymentVisibilitySettings {
  visibleMethods: Array<"upi" | "card" | "cod">;
}

interface StorefrontState {
  theme: ThemeTokens;
  brandStyle: BrandStyleTokens;
  layout: LayoutTokens;
  products: HerbProduct[];
  categories: string[];
  stories: CustomerStory[];
  payments: PaymentRecord[];
  marketplaces: MarketplaceLinks;
  media: StorefrontMediaSettings;
  paymentVisibility: PaymentVisibilitySettings;
}

interface AddProductInput {
  name: string;
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  price: number;
  stock: number;
  shortDescription: string;
  botanicalName: string;
  unitLabel: string;
  toneClass: string;
}

interface AddStoryInput {
  name: string;
  city: string;
  quote: string;
  improvement: string;
}

interface RecordPaymentInput {
  orderNumber: string;
  customerName: string;
  amount: number;
  method: string;
  status: "PAID" | "PENDING" | "FAILED";
}

interface StorefrontContextValue {
  state: StorefrontState;
  updateTheme: (patch: Partial<ThemeTokens>) => void;
  resetTheme: () => void;
  updateBrandStyle: (patch: Partial<BrandStyleTokens>) => void;
  resetBrandStyle: () => void;
  updateLayout: (patch: Partial<LayoutTokens>) => void;
  resetLayout: () => void;
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  addProduct: (input: AddProductInput) => void;
  updateProductImages: (id: string, imageUrls: string[]) => void;
  removeProduct: (id: string) => void;
  addStory: (input: AddStoryInput) => void;
  removeStory: (id: string) => void;
  recordPayment: (input: RecordPaymentInput) => void;
  updateMarketplaces: (patch: Partial<MarketplaceLinks>) => void;
  resetMarketplaces: () => void;
  updateMedia: (patch: Partial<StorefrontMediaSettings>) => void;
  resetMedia: () => void;
  updatePaymentVisibility: (methods: Array<"upi" | "card" | "cod">) => void;
  resetPaymentVisibility: () => void;
}

const STORAGE_KEY = "swarna-storefront-v1";
const THEME_REVISION = 3;
const defaultStories: CustomerStory[] = siteConfig.home.stories.map((story, index) => ({
  id: `story-${index + 1}`,
  ...story,
}));

const defaultState: StorefrontState = {
  theme: siteConfig.theme,
  brandStyle: siteConfig.brandStyle,
  layout: siteConfig.layout,
  products: herbCatalog,
  categories: getUniqueCategories(herbCatalog, starterCategories),
  stories: defaultStories,
  payments: [],
  marketplaces: siteConfig.marketplaces,
  media: siteConfig.storefront,
  paymentVisibility: {
    visibleMethods: siteConfig.storefront.visiblePaymentMethods,
  },
};

const iconThemeValues: IconTheme[] = [
  "botanical-line",
  "ayurvedic-seal",
  "clinical-minimal",
  "premium-mono",
];
const shapeThemeValues: ShapeTheme[] = [
  "seed",
  "leaf",
  "petal",
  "stone",
  "butterfly",
];
const iconBackgroundValues: IconBackgroundMode[] = ["none", "soft", "solid"];
const radiusScaleValues: RadiusScale[] = ["soft", "medium", "bold"];
const iconStrokeValues: IconStrokeWidth[] = [1.5, 2, 2.5];
const buttonStyleValues: ButtonStyle[] = [
  "filled-soft",
  "outline-soft",
  "text-minimal",
];

const layoutCssKeyMap: Record<keyof LayoutTokens, string> = {
  shellMaxWidthPx: "--shell-max-width",
  shellSideMarginPx: "--shell-side-margin",
  heroMinHeightVh: "--hero-min-height",
  cardRadiusPx: "--surface-radius",
  sectionGapPx: "--section-gap",
};

const themeCssKeyMap: Record<keyof ThemeTokens, string> = {
  bg: "--bg",
  paper: "--paper",
  paperRich: "--paper-rich",
  ink: "--ink",
  inkSoft: "--ink-soft",
  outline: "--outline",
  line: "--line",
  gold: "--gold",
  goldSoft: "--gold-soft",
  sage: "--sage",
  clay: "--clay",
  jade: "--jade",
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeImageUrl(value: string | undefined) {
  const normalized = (value ?? "").trim();
  if (!normalized) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizeImageUrls(values: string[] | undefined, fallback?: string) {
  const seen = new Set<string>();
  return [...(values ?? []), fallback ?? ""]
    .map((item) => normalizeImageUrl(item))
    .filter((item): item is string => Boolean(item))
    .filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    })
    .slice(0, 5);
}

function normalizeProduct(product: HerbProduct): HerbProduct {
  const images = normalizeImageUrls(product.images, product.imageUrl);
  return {
    ...product,
    imageUrl: images[0],
    images,
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function normalizeLayout(layout: Partial<LayoutTokens> | undefined): LayoutTokens {
  return {
    shellMaxWidthPx: clampNumber(
      layout?.shellMaxWidthPx,
      1100,
      1560,
      defaultState.layout.shellMaxWidthPx,
    ),
    shellSideMarginPx: clampNumber(
      layout?.shellSideMarginPx,
      16,
      84,
      defaultState.layout.shellSideMarginPx,
    ),
    heroMinHeightVh: clampNumber(
      layout?.heroMinHeightVh,
      42,
      78,
      defaultState.layout.heroMinHeightVh,
    ),
    cardRadiusPx: clampNumber(
      layout?.cardRadiusPx,
      2,
      24,
      defaultState.layout.cardRadiusPx,
    ),
    sectionGapPx: clampNumber(
      layout?.sectionGapPx,
      10,
      40,
      defaultState.layout.sectionGapPx,
    ),
  };
}

function normalizeExternalUrl(value: string | undefined, fallback: string) {
  const normalized = (value ?? "").trim();
  if (!normalized) {
    return fallback;
  }

  if (!/^https?:\/\//i.test(normalized)) {
    return fallback;
  }

  return normalized;
}

function normalizeMediaUrls(values: string[] | undefined, fallback: string[] = []) {
  const seen = new Set<string>();
  return [...(values ?? []), ...fallback]
    .map((item) => normalizeImageUrl(item))
    .filter((item): item is string => Boolean(item))
    .filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    })
    .slice(0, 8);
}

function mergeDefaultCatalogProducts(rawProducts: HerbProduct[]) {
  if (!rawProducts.length) {
    return defaultState.products;
  }

  const normalizedProducts = rawProducts.map(normalizeProduct);
  const existingIds = new Set(normalizedProducts.map((item) => item.id));
  const existingSlugs = new Set(normalizedProducts.map((item) => item.slug));
  const missingDefaults = defaultState.products.filter(
    (product) => !existingIds.has(product.id) && !existingSlugs.has(product.slug),
  );

  return [...normalizedProducts, ...missingDefaults];
}

function normalizeState(
  raw: Partial<StorefrontState> & { themeRevision?: number },
): StorefrontState {
  const shouldResetTheme = raw.themeRevision !== THEME_REVISION;
  const theme = shouldResetTheme
    ? defaultState.theme
    : { ...defaultState.theme, ...(raw.theme ?? {}) };
  const rawBrand: Partial<BrandStyleTokens> = shouldResetTheme
    ? defaultState.brandStyle
    : (raw.brandStyle ?? {});
  const brandStyle: BrandStyleTokens = {
    iconTheme: iconThemeValues.includes(rawBrand.iconTheme as IconTheme)
      ? (rawBrand.iconTheme as IconTheme)
      : defaultState.brandStyle.iconTheme,
    shapeTheme: shapeThemeValues.includes(rawBrand.shapeTheme as ShapeTheme)
      ? (rawBrand.shapeTheme as ShapeTheme)
      : defaultState.brandStyle.shapeTheme,
    iconBackground: iconBackgroundValues.includes(
      rawBrand.iconBackground as IconBackgroundMode,
    )
      ? (rawBrand.iconBackground as IconBackgroundMode)
      : defaultState.brandStyle.iconBackground,
    radiusScale: radiusScaleValues.includes(rawBrand.radiusScale as RadiusScale)
      ? (rawBrand.radiusScale as RadiusScale)
      : defaultState.brandStyle.radiusScale,
    iconStrokeWidth: iconStrokeValues.includes(
      Number(rawBrand.iconStrokeWidth) as IconStrokeWidth,
    )
      ? (Number(rawBrand.iconStrokeWidth) as IconStrokeWidth)
      : defaultState.brandStyle.iconStrokeWidth,
    buttonStyle: buttonStyleValues.includes(rawBrand.buttonStyle as ButtonStyle)
      ? (rawBrand.buttonStyle as ButtonStyle)
      : defaultState.brandStyle.buttonStyle,
  };
  const layout = normalizeLayout(raw.layout);
  const products =
    Array.isArray(raw.products) && raw.products.length > 0
      ? mergeDefaultCatalogProducts(raw.products)
      : defaultState.products;
  const categoriesFromProducts = getUniqueCategories(products);
  const extraCategories = Array.isArray(raw.categories)
    ? raw.categories.map((item) => item.trim()).filter(Boolean)
    : [];
  const categories = getUniqueCategories(
    products,
    [...defaultState.categories, ...categoriesFromProducts, ...extraCategories],
  );
  const stories = Array.isArray(raw.stories) && raw.stories.length > 0 ? raw.stories : defaultState.stories;
  const payments = Array.isArray(raw.payments) ? raw.payments : [];
  const marketplaces = {
    amazonUrl: normalizeExternalUrl(
      raw.marketplaces?.amazonUrl,
      defaultState.marketplaces.amazonUrl,
    ),
    flipkartUrl: normalizeExternalUrl(
      raw.marketplaces?.flipkartUrl,
      defaultState.marketplaces.flipkartUrl,
    ),
  };
  const media = {
    heroMediaUrls: normalizeMediaUrls(raw.media?.heroMediaUrls, defaultState.media.heroMediaUrls),
    reviewMediaUrls: normalizeMediaUrls(
      raw.media?.reviewMediaUrls,
      defaultState.media.reviewMediaUrls,
    ),
  };
  const allowedMethods = ["upi", "card", "cod"] as const;
  const visibleMethods = Array.isArray(raw.paymentVisibility?.visibleMethods)
    ? raw.paymentVisibility.visibleMethods.filter((item): item is "upi" | "card" | "cod" =>
        allowedMethods.includes(item as "upi" | "card" | "cod"),
      )
    : defaultState.paymentVisibility.visibleMethods;
  return {
    theme,
    brandStyle,
    layout,
    products,
    categories,
    stories,
    payments,
    marketplaces,
    media,
    paymentVisibility: {
      visibleMethods: visibleMethods.length
        ? visibleMethods
        : defaultState.paymentVisibility.visibleMethods,
    },
  };
}

function getInitialState() {
  return defaultState;
}

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StorefrontState>(getInitialState);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<StorefrontState> & {
        themeRevision?: number;
      };
      setState(normalizeState(parsed));
    } catch {
      // Keep defaults when persisted payload is malformed.
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as Partial<StorefrontState> & {
          themeRevision?: number;
        };
        setState(normalizeState(parsed));
      } catch {
        // Ignore malformed cross-tab updates.
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        themeRevision: THEME_REVISION,
      }),
    );
  }, [state, hasLoadedStorage]);

  useEffect(() => {
    let isCancelled = false;

    async function loadProductOverrides() {
      try {
        const response = await fetch("/api/storefront/products", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          products?: Array<{ slug: string; images: string[] }>;
        };

        if (!response.ok || !payload.products?.length || isCancelled) {
          return;
        }

        setState((prev) => ({
          ...prev,
          products: mergeStorefrontProductOverrides(prev.products, payload.products ?? []),
        }));
      } catch {
        // Ignore override fetch failures and keep current storefront state.
      }
    }

    void loadProductOverrides();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadStorefrontSettings() {
      try {
        const response = await fetch("/api/storefront/settings", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          settings?: {
            media?: {
              heroMediaUrls?: string[];
              reviewMediaUrls?: string[];
            };
            paymentVisibility?: {
              visibleMethods?: Array<"upi" | "card" | "cod">;
            };
          };
        };

        if (!response.ok || !payload.settings || isCancelled) {
          return;
        }

        setState((prev) => ({
          ...prev,
          media: {
            heroMediaUrls: normalizeMediaUrls(
              payload.settings?.media?.heroMediaUrls,
              prev.media.heroMediaUrls,
            ),
            reviewMediaUrls: normalizeMediaUrls(
              payload.settings?.media?.reviewMediaUrls,
              prev.media.reviewMediaUrls,
            ),
          },
          paymentVisibility: {
            visibleMethods:
              payload.settings?.paymentVisibility?.visibleMethods?.length
                ? payload.settings.paymentVisibility.visibleMethods
                : prev.paymentVisibility.visibleMethods,
          },
        }));
      } catch {
        // Ignore settings fetch failures and keep current storefront state.
      }
    }

    void loadStorefrontSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(state.theme) as Array<[keyof ThemeTokens, string]>;
    for (const [themeKey, value] of entries) {
      root.style.setProperty(themeCssKeyMap[themeKey], value);
    }
  }, [state.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-icon-theme", state.brandStyle.iconTheme);
    root.setAttribute("data-shape-theme", state.brandStyle.shapeTheme);
    root.setAttribute("data-icon-background", state.brandStyle.iconBackground);
    root.setAttribute("data-radius-scale", state.brandStyle.radiusScale);
    root.setAttribute("data-button-style", state.brandStyle.buttonStyle);
    root.style.setProperty("--icon-stroke-width", String(state.brandStyle.iconStrokeWidth));
  }, [state.brandStyle]);

  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(state.layout) as Array<[keyof LayoutTokens, number]>;
    for (const [layoutKey, value] of entries) {
      const cssValue = layoutKey === "heroMinHeightVh" ? `${value}vh` : `${value}px`;
      root.style.setProperty(layoutCssKeyMap[layoutKey], cssValue);
    }
  }, [state.layout]);

  const updateTheme = useCallback((patch: Partial<ThemeTokens>) => {
    setState((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...patch },
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: defaultState.theme }));
  }, []);

  const updateBrandStyle = useCallback((patch: Partial<BrandStyleTokens>) => {
    setState((prev) => ({
      ...prev,
      brandStyle: { ...prev.brandStyle, ...patch },
    }));
  }, []);

  const resetBrandStyle = useCallback(() => {
    setState((prev) => ({ ...prev, brandStyle: defaultState.brandStyle }));
  }, []);

  const updateLayout = useCallback((patch: Partial<LayoutTokens>) => {
    setState((prev) => ({
      ...prev,
      layout: normalizeLayout({ ...prev.layout, ...patch }),
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setState((prev) => ({ ...prev, layout: defaultState.layout }));
  }, []);

  const addCategory = useCallback((name: string) => {
    const normalized = name.trim();
    if (!normalized) {
      return;
    }

    setState((prev) => {
      const exists = prev.categories.some(
        (item) => item.toLowerCase() === normalized.toLowerCase(),
      );
      if (exists) {
        return prev;
      }
      return { ...prev, categories: [...prev.categories, normalized] };
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    setState((prev) => {
      const nextCategories = prev.categories.filter(
        (item) => item.toLowerCase() !== name.toLowerCase(),
      );
      const fallbackCategory = nextCategories[0] ?? defaultState.categories[0];
      const nextProducts = prev.products.map((product) =>
        product.category.toLowerCase() === name.toLowerCase()
          ? { ...product, category: fallbackCategory }
          : product,
      );

      return {
        ...prev,
        categories: nextCategories.length > 0 ? nextCategories : [fallbackCategory],
        products: nextProducts,
      };
    });
  }, []);

  const addProduct = useCallback((input: AddProductInput) => {
    const name = input.name.trim();
    if (!name) {
      return;
    }

    const slugBase = createSlug(name);
    setState((prev) => {
      const existingSlugs = new Set(prev.products.map((item) => item.slug));
      let slug = slugBase || `product-${Date.now()}`;
      let suffix = 1;
      while (existingSlugs.has(slug)) {
        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }

      const category = input.category.trim() || defaultState.categories[0];
      const imageUrls = normalizeImageUrls(input.imageUrls, input.imageUrl);
      const imageUrl = imageUrls[0];
      const product: HerbProduct = {
        id: `custom-${Date.now()}`,
        slug,
        name,
        imageUrl,
        images: imageUrls,
        botanicalName: input.botanicalName.trim() || "Herbal Blend",
        category,
        shortDescription: input.shortDescription.trim() || "Premium wellness herb.",
        description: input.shortDescription.trim() || "Premium wellness herb.",
        benefits: ["Supports everyday wellness"],
        usage: "Use as directed by your wellness routine.",
        unitLabel: input.unitLabel.trim() || "100g",
        price: Math.max(1, Math.round(input.price)),
        stock: Math.max(0, Math.round(input.stock)),
        featured: false,
        toneClass: input.toneClass,
      };

      const categories = prev.categories.some((item) => item.toLowerCase() === category.toLowerCase())
        ? prev.categories
        : [...prev.categories, category];

      return {
        ...prev,
        categories,
        products: [product, ...prev.products],
      };
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setState((prev) => {
      const nextProducts = prev.products.filter((item) => item.id !== id);
      if (nextProducts.length === prev.products.length) {
        return prev;
      }
      return {
        ...prev,
        products: nextProducts,
      };
    });
  }, []);

  const updateProductImages = useCallback((id: string, imageUrls: string[]) => {
    const images = normalizeImageUrls(imageUrls);
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === id
          ? {
              ...product,
              imageUrl: images[0],
              images,
            }
          : product,
      ),
    }));
  }, []);

  const addStory = useCallback((input: AddStoryInput) => {
    if (!input.name.trim() || !input.quote.trim()) {
      return;
    }

    setState((prev) => ({
      ...prev,
      stories: [
        {
          id: `story-${Date.now()}`,
          name: input.name.trim(),
          city: input.city.trim() || "India",
          quote: input.quote.trim(),
          improvement: input.improvement.trim() || "Positive wellness experience",
        },
        ...prev.stories,
      ],
    }));
  }, []);

  const removeStory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      stories: prev.stories.filter((story) => story.id !== id),
    }));
  }, []);

  const recordPayment = useCallback((input: RecordPaymentInput) => {
    setState((prev) => ({
      ...prev,
      payments: [
        {
          id: `payment-${Date.now()}`,
          orderNumber: input.orderNumber,
          customerName: input.customerName.trim() || "Customer",
          amount: Math.max(0, Math.round(input.amount)),
          method: input.method,
          status: input.status,
          createdAt: new Date().toISOString(),
        },
        ...prev.payments,
      ],
    }));
  }, []);

  const updateMarketplaces = useCallback((patch: Partial<MarketplaceLinks>) => {
    setState((prev) => ({
      ...prev,
      marketplaces: {
        amazonUrl: normalizeExternalUrl(
          patch.amazonUrl,
          prev.marketplaces.amazonUrl,
        ),
        flipkartUrl: normalizeExternalUrl(
          patch.flipkartUrl,
          prev.marketplaces.flipkartUrl,
        ),
      },
    }));
  }, []);

  const resetMarketplaces = useCallback(() => {
    setState((prev) => ({
      ...prev,
      marketplaces: defaultState.marketplaces,
    }));
  }, []);

  const updateMedia = useCallback((patch: Partial<StorefrontMediaSettings>) => {
    setState((prev) => ({
      ...prev,
      media: {
        heroMediaUrls: normalizeMediaUrls(
          patch.heroMediaUrls,
          prev.media.heroMediaUrls,
        ),
        reviewMediaUrls: normalizeMediaUrls(
          patch.reviewMediaUrls,
          prev.media.reviewMediaUrls,
        ),
      },
    }));
  }, []);

  const resetMedia = useCallback(() => {
    setState((prev) => ({
      ...prev,
      media: defaultState.media,
    }));
  }, []);

  const updatePaymentVisibility = useCallback((methods: Array<"upi" | "card" | "cod">) => {
    setState((prev) => ({
      ...prev,
      paymentVisibility: {
        visibleMethods: methods.length ? methods : ["cod"],
      },
    }));
  }, []);

  const resetPaymentVisibility = useCallback(() => {
    setState((prev) => ({
      ...prev,
      paymentVisibility: defaultState.paymentVisibility,
    }));
  }, []);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      state,
      updateTheme,
      resetTheme,
      updateBrandStyle,
      resetBrandStyle,
      updateLayout,
      resetLayout,
      addCategory,
      removeCategory,
      addProduct,
      updateProductImages,
      removeProduct,
      addStory,
      removeStory,
      recordPayment,
      updateMarketplaces,
      resetMarketplaces,
      updateMedia,
      resetMedia,
      updatePaymentVisibility,
      resetPaymentVisibility,
    }),
    [
      state,
      updateTheme,
      resetTheme,
      updateBrandStyle,
      resetBrandStyle,
      updateLayout,
      resetLayout,
      addCategory,
      removeCategory,
      addProduct,
      updateProductImages,
      removeProduct,
      addStory,
      removeStory,
      recordPayment,
      updateMarketplaces,
      resetMarketplaces,
      updateMedia,
      resetMedia,
      updatePaymentVisibility,
      resetPaymentVisibility,
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }
  return context;
}
