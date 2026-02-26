export type HerbCategory = string;

export interface HerbProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  botanicalName: string;
  category: HerbCategory;
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  unitLabel: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured: boolean;
  toneClass: string;
}

export const starterCategories = [
  "Herbal Powders",
  "Wellness Oils",
  "Functional Foods",
  "Herbal Teas",
  "Capsules",
  "Digestive Support",
];

export const herbCatalog: HerbProduct[] = [
  {
    id: "tulsi-leaf-cut",
    slug: "tulsi-leaf-cut",
    name: "Tulsi Leaf Cut",
    botanicalName: "Ocimum tenuiflorum",
    category: "Herbal Teas",
    shortDescription: "Fragrant holy basil leaves for teas and kadha blends.",
    description:
      "Hand-selected tulsi leaves, gently dried to retain aroma and natural oils. Perfect for immunity tea, steam infusions, and daily evening brews.",
    benefits: [
      "Supports seasonal immunity",
      "Naturally aromatic and caffeine free",
      "Pairs well with ginger and honey",
    ],
    usage: "Steep 1 tsp in hot water for 5-7 minutes.",
    unitLabel: "100g pouch",
    price: 299,
    compareAtPrice: 349,
    stock: 78,
    featured: true,
    toneClass: "tone-tulsi",
  },
  {
    id: "ashwagandha-root-powder",
    slug: "ashwagandha-root-powder",
    name: "Ashwagandha Root Powder",
    botanicalName: "Withania somnifera",
    category: "Herbal Powders",
    shortDescription: "Traditional adaptogenic root for calm and recovery.",
    description:
      "Stone-ground ashwagandha root powder from tested farm lots. Ideal for bedtime milk, smoothies, or daily wellness tonics.",
    benefits: [
      "Adaptogenic support for stress balance",
      "Smooth earthy taste with warm drinks",
      "Lab-tested for purity",
    ],
    usage: "Mix 1/2 tsp with warm milk or water once daily.",
    unitLabel: "200g jar",
    price: 549,
    compareAtPrice: 620,
    stock: 54,
    featured: true,
    toneClass: "tone-ashwagandha",
  },
  {
    id: "moringa-leaf-powder",
    slug: "moringa-leaf-powder",
    name: "Moringa Leaf Powder",
    botanicalName: "Moringa oleifera",
    category: "Functional Foods",
    shortDescription: "Nutrient-rich moringa powder for smoothies and meals.",
    description:
      "Fine-milled moringa leaves with a fresh green profile. Add to juices, smoothies, soups, or atta for everyday nutrition.",
    benefits: [
      "Rich in natural micronutrients",
      "Easy to blend in food and drinks",
      "No fillers or additives",
    ],
    usage: "Use 1 tsp in smoothie, buttermilk, or dal.",
    unitLabel: "250g pack",
    price: 429,
    stock: 91,
    featured: false,
    toneClass: "tone-moringa",
  },
  {
    id: "brahmi-dried-herb",
    slug: "brahmi-dried-herb",
    name: "Brahmi Dried Herb",
    botanicalName: "Bacopa monnieri",
    category: "Herbal Powders",
    shortDescription: "Classic brahmi herb for focus-support blends.",
    description:
      "Sun-dried brahmi leaves prepared for tea decoctions and herbal formulations. Popular for mindful daily routines.",
    benefits: [
      "Traditionally used for cognitive wellness",
      "Mild earthy profile for infusions",
      "Sourced from small grower clusters",
    ],
    usage: "Simmer 1 tsp in water for 6 minutes and strain.",
    unitLabel: "100g pouch",
    price: 389,
    compareAtPrice: 439,
    stock: 47,
    featured: false,
    toneClass: "tone-brahmi",
  },
  {
    id: "turmeric-golden-blend",
    slug: "turmeric-golden-blend",
    name: "Turmeric Golden Blend",
    botanicalName: "Curcuma longa blend",
    category: "Functional Foods",
    shortDescription: "Turmeric, black pepper, and ginger wellness mix.",
    description:
      "Balanced golden blend with high-curcumin turmeric and pepper for enhanced absorption. Great for golden milk and broths.",
    benefits: [
      "Warm immunity support blend",
      "Contains pepper for better curcumin uptake",
      "Convenient ready-to-use formula",
    ],
    usage: "Add 1 tsp to warm milk with jaggery or honey.",
    unitLabel: "150g tin",
    price: 459,
    stock: 63,
    featured: true,
    toneClass: "tone-turmeric",
  },
  {
    id: "neem-detox-mix",
    slug: "neem-detox-mix",
    name: "Neem Detox Mix",
    botanicalName: "Azadirachta indica blend",
    category: "Digestive Support",
    shortDescription: "Neem-forward detox powder with mint and fennel.",
    description:
      "A bitter-fresh herbal blend crafted for light digestive support. Works best in small morning servings with warm water.",
    benefits: [
      "Traditional digestive support",
      "Balanced with cooling mint notes",
      "Carefully measured bitter profile",
    ],
    usage: "Mix 1/4 tsp in warm water after breakfast.",
    unitLabel: "120g jar",
    price: 339,
    stock: 38,
    featured: false,
    toneClass: "tone-neem",
  },
  {
    id: "triphala-capsules",
    slug: "triphala-capsules",
    name: "Triphala Capsules",
    botanicalName: "Amla, Haritaki, Bibhitaki",
    category: "Capsules",
    shortDescription: "Convenient capsule format of classic triphala.",
    description:
      "Standardized triphala capsules for people who prefer no-prep wellness routines. Made with vegetarian capsules.",
    benefits: [
      "Classic Ayurvedic digestive blend",
      "Easy daily capsule format",
      "Travel-friendly bottle",
    ],
    usage: "Take 1 capsule after meals with water.",
    unitLabel: "60 capsules",
    price: 499,
    compareAtPrice: 560,
    stock: 112,
    featured: true,
    toneClass: "tone-triphala",
  },
  {
    id: "ginger-mint-infusion",
    slug: "ginger-mint-infusion",
    name: "Ginger Mint Infusion",
    botanicalName: "Zingiber officinale blend",
    category: "Herbal Teas",
    shortDescription: "Refreshing digestion-friendly herbal infusion blend.",
    description:
      "A bright blend of ginger flakes, peppermint, and lemongrass. Great for post-meal tea and anytime refreshment.",
    benefits: [
      "Comforting after meals",
      "Naturally uplifting aroma",
      "No artificial flavors",
    ],
    usage: "Steep 1 tbsp in hot water for 4 minutes.",
    unitLabel: "18 tea bags",
    price: 279,
    stock: 126,
    featured: false,
    toneClass: "tone-ginger",
  },
  {
    id: "bhringraj-scalp-oil",
    slug: "bhringraj-scalp-oil",
    name: "Bhringraj Scalp Nourish Oil",
    botanicalName: "Eclipta alba infusion",
    category: "Wellness Oils",
    shortDescription: "Cold-infused hair and scalp care oil with bhringraj and brahmi.",
    description:
      "Slow-infused bhringraj oil crafted for weekly scalp nourishment rituals. Lightweight texture, non-sticky finish, and herbal aroma.",
    benefits: [
      "Supports healthier scalp care routine",
      "Traditional bhringraj and brahmi infusion",
      "Ideal for overnight oiling ritual",
    ],
    usage: "Massage into scalp and hair lengths 2-3 times a week.",
    unitLabel: "100ml glass bottle",
    price: 599,
    compareAtPrice: 699,
    stock: 40,
    featured: true,
    toneClass: "tone-brahmi",
  },
  {
    id: "amla-probiotic-bites",
    slug: "amla-probiotic-bites",
    name: "Amla Probiotic Bites",
    botanicalName: "Emblica officinalis blend",
    category: "Functional Foods",
    shortDescription: "Tangy amla wellness bites with jaggery and gut-friendly herbs.",
    description:
      "Chewy daily wellness bites made with amla, roasted jeera, and digestive botanicals. Built for post-meal gut comfort and immunity support.",
    benefits: [
      "Supports post-meal digestion comfort",
      "Rich amla profile for daily vitality",
      "Portable healthy snacking option",
    ],
    usage: "Enjoy 1-2 bites after lunch or dinner.",
    unitLabel: "180g pouch",
    price: 349,
    stock: 72,
    featured: false,
    toneClass: "tone-triphala",
  },
];

export const herbCategories = getUniqueCategories(herbCatalog, starterCategories);

export const featuredHerbs = herbCatalog.filter((item) => item.featured);

export function getHerbBySlug(slug: string) {
  return herbCatalog.find((item) => item.slug === slug);
}

export function getHerbById(id: string) {
  return herbCatalog.find((item) => item.id === id);
}

export function getUniqueCategories(products: HerbProduct[], additional: string[] = []) {
  const fromProducts = products.map((item) => item.category.trim()).filter(Boolean);
  const normalizedAdditional = additional.map((item) => item.trim()).filter(Boolean);
  return [...new Set([...normalizedAdditional, ...fromProducts])];
}
