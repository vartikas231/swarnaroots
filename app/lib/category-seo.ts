import {
  getUniqueCategories,
  herbCatalog,
  starterCategories,
  type HerbProduct,
} from "@/app/data/herbs";

const ADDITIONAL_SEO_CATEGORIES = ["Wellness Candles", "Himachal Teas"];

interface CategoryDetail {
  tagline: string;
  description: string;
  originStory: string;
  marketFocus: string[];
  keywords: string[];
}

export interface CategorySeoProfile {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  originStory: string;
  marketFocus: string[];
  keywords: string[];
  productCount: number;
  indexable: boolean;
}

const CATEGORY_DETAILS: Record<string, CategoryDetail> = {
  "Herbal Powders": {
    tagline: "Daily Ayurveda staples",
    description:
      "Explore finely prepared herbal powders for immunity, digestion, stress balance, and everyday vitality routines.",
    originStory:
      "Small-lot grinding and mindful handling help preserve aroma, texture, and natural character.",
    marketFocus: ["India daily wellness", "US clean-label routines"],
    keywords: [
      "ayurvedic herbal powders",
      "ashwagandha powder",
      "moringa powder",
      "natural wellness powders",
    ],
  },
  "Wellness Oils": {
    tagline: "Ritual-grade oil blends",
    description:
      "Traditional wellness oils crafted for scalp, body, and recovery rituals with botanical infusions.",
    originStory:
      "Oil lots are prepared in small batches with ingredient traceability and practical daily-use consistency.",
    marketFocus: ["India hair care rituals", "US holistic self-care"],
    keywords: [
      "ayurvedic wellness oils",
      "bhringraj oil",
      "herbal scalp oil",
      "natural massage oils",
    ],
  },
  "Functional Foods": {
    tagline: "Food-first herbal nutrition",
    description:
      "Functional foods built for modern routines, with herbs and botanicals that support digestion, immunity, and daily nourishment.",
    originStory:
      "Designed for practical use in milk, smoothies, broths, and post-meal wellness habits.",
    marketFocus: ["India family nutrition", "US functional wellness"],
    keywords: [
      "functional herbal foods",
      "turmeric blend",
      "amla products",
      "ayurvedic nutrition",
    ],
  },
  Spices: {
    tagline: "Kitchen wellness spices",
    description:
      "Discover clean, aromatic spice blends crafted for daily Indian cooking with freshness, balance, and authentic flavor.",
    originStory:
      "Our spice collection is inspired by home-style recipes and hill-region ingredient quality standards.",
    marketFocus: ["India everyday cooking", "US Indian pantry essentials"],
    keywords: [
      "indian spice blends",
      "garam masala online",
      "natural spices",
      "himachal spices",
    ],
  },
  "Herbal Teas": {
    tagline: "Comforting herbal infusions",
    description:
      "Caffeine-free tea and infusion blends made for digestion, calm evenings, and daily immunity support.",
    originStory:
      "Aroma-preserving drying and blending methods keep every cup rich, warm, and naturally expressive.",
    marketFocus: ["India post-meal tea culture", "US caffeine-free tea buyers"],
    keywords: [
      "herbal teas india",
      "digestive herbal tea",
      "caffeine free ayurvedic tea",
      "tulsi tea blend",
    ],
  },
  "Himachal Teas": {
    tagline: "Freshness inspired by Himachal",
    description:
      "Palampur and hill-region inspired tea selections crafted to bring clean mountain character to everyday cups.",
    originStory:
      "This collection reflects Swarna Roots' family connection to Himachal and its heritage of mindful farming.",
    marketFocus: ["India premium tea market", "US origin-led specialty tea"],
    keywords: [
      "palampur tea",
      "himachal tea",
      "kangra valley tea",
      "mountain tea india",
    ],
  },
  Capsules: {
    tagline: "Convenient no-prep wellness",
    description:
      "Vegetarian herbal capsules for customers who prefer consistent dosage and easy daily routines.",
    originStory:
      "Capsule formulations are selected for simplicity, portability, and dependable usage cadence.",
    marketFocus: ["India practical wellness", "US supplement convenience"],
    keywords: [
      "ayurvedic capsules",
      "triphala capsules",
      "herbal supplement capsules",
      "digestive support capsules",
    ],
  },
  "Digestive Support": {
    tagline: "Digestive comfort first",
    description:
      "Targeted digestive support blends designed for post-meal comfort and balanced gut-friendly routines.",
    originStory:
      "Blends are tuned for taste balance and easy integration into daily health habits.",
    marketFocus: ["India digestive blends", "US gut wellness buyers"],
    keywords: [
      "digestive herbs",
      "gut support ayurveda",
      "neem digestive blend",
      "post-meal wellness",
    ],
  },
  "Wellness Candles": {
    tagline: "Botanical ambience and calm",
    description:
      "Natural wellness candles with herb-forward aromas to support winding down, yoga, and mindful living spaces.",
    originStory:
      "Scent profiles are inspired by botanical notes familiar to Indian wellness homes and modern calm interiors.",
    marketFocus: ["India premium home wellness", "US clean home fragrance"],
    keywords: [
      "herbal candles",
      "wellness candles india",
      "natural aroma candles",
      "botanical home fragrance",
    ],
  },
};

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toCategorySlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDefaultCategoryDetail(name: string): CategoryDetail {
  return {
    tagline: "Natural wellness category",
    description: `Explore ${name.toLowerCase()} crafted for premium ayurvedic wellness routines.`,
    originStory:
      "This category is part of Swarna Roots' focus on trustworthy, small-batch natural wellness products.",
    marketFocus: ["India wellness buyers", "US natural product buyers"],
    keywords: [`${name.toLowerCase()} online`, "natural wellness products"],
  };
}

function getProductsForCategoryName(name: string): HerbProduct[] {
  return herbCatalog.filter(
    (product) => product.category.toLowerCase() === name.toLowerCase(),
  );
}

const categoryNames = getUniqueCategories(herbCatalog, [
  ...starterCategories,
  ...ADDITIONAL_SEO_CATEGORIES,
]);

const categoryProfiles: CategorySeoProfile[] = categoryNames.map((name) => {
  const details = CATEGORY_DETAILS[name] ?? toDefaultCategoryDetail(name);
  const products = getProductsForCategoryName(name);
  return {
    name,
    slug: toCategorySlug(name),
    tagline: details.tagline,
    description: details.description,
    originStory: details.originStory,
    marketFocus: details.marketFocus,
    keywords: details.keywords,
    productCount: products.length,
    indexable: products.length > 0,
  };
});

const categoryByName = new Map(
  categoryProfiles.map((profile) => [profile.name.toLowerCase(), profile]),
);
const categoryBySlug = new Map(
  categoryProfiles.map((profile) => [profile.slug, profile]),
);

export function getAllCategoryProfiles() {
  return categoryProfiles;
}

export function getIndexableCategoryProfiles() {
  return categoryProfiles.filter((profile) => profile.indexable);
}

export function getCategoryProfileByName(name: string) {
  return categoryByName.get(name.toLowerCase()) ?? null;
}

export function getCategoryProfileBySlug(slug: string) {
  return categoryBySlug.get(slug) ?? null;
}

export function getCategoryPathByName(name: string) {
  const profile = getCategoryProfileByName(name);
  return profile ? `/shop/category/${profile.slug}` : null;
}

export function getProductsForCategory(slug: string) {
  const profile = getCategoryProfileBySlug(slug);
  if (!profile) {
    return [];
  }

  return getProductsForCategoryName(profile.name);
}

export function getReadableCategoryNameFromSlug(slug: string) {
  const known = getCategoryProfileBySlug(slug);
  return known?.name ?? toTitleCaseFromSlug(slug);
}
