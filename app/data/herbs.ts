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
  "Spices",
  "Herbal Teas",
  "Himachal Teas",
  "Wellness Candles",
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
  {
    id: "palampur-kangra-green-tea",
    slug: "palampur-kangra-green-tea",
    name: "Palampur Kangra Green Tea",
    botanicalName: "Camellia sinensis (Kangra Valley)",
    category: "Himachal Teas",
    shortDescription: "Mountain-grown green tea with a crisp, floral Himachal profile.",
    description:
      "A fresh Kangra-style green tea inspired by Palampur tea craft. Smooth body, bright aroma, and clean finish for mindful daily sipping.",
    benefits: [
      "Light mountain character and balanced taste",
      "Supports a calm, refreshing tea ritual",
      "Ideal for morning and mid-day cups",
    ],
    usage: "Steep 1 tea bag in hot water for 2-3 minutes.",
    unitLabel: "25 tea bags",
    price: 389,
    compareAtPrice: 449,
    stock: 65,
    featured: true,
    toneClass: "tone-ginger",
  },
  {
    id: "devdar-tulsi-wellness-candle",
    slug: "devdar-tulsi-wellness-candle",
    name: "Devdar Tulsi Wellness Candle",
    botanicalName: "Soy wax with cedar and tulsi oils",
    category: "Wellness Candles",
    shortDescription: "A clean-burning botanical candle for calm evening rituals.",
    description:
      "Hand-poured soy candle infused with cedarwood and tulsi-inspired aroma notes. Built for meditation corners, bedtime wind-down, and mindful spaces.",
    benefits: [
      "Warm botanical aroma for restful ambience",
      "Minimal-soot clean burn profile",
      "Pairs well with tea, journaling, and yoga routines",
    ],
    usage:
      "Trim wick to 1/4 inch, burn 2-3 hours per session, and keep away from drafts.",
    unitLabel: "180g glass jar",
    price: 699,
    stock: 42,
    featured: false,
    toneClass: "tone-brahmi",
  },
  {
    id: "rose-fennel-digest-tea",
    slug: "rose-fennel-digest-tea",
    name: "Rose Fennel Digest Tea",
    botanicalName: "Foeniculum vulgare blend",
    category: "Herbal Teas",
    shortDescription: "Floral fennel infusion crafted for gentle post-meal comfort.",
    description:
      "A soothing blend of fennel, dried rose petals, and cardamom-inspired notes. Great for evening tea routines and digestive balance.",
    benefits: [
      "Helps with light post-meal comfort",
      "Naturally caffeine-free and aromatic",
      "Mild sweet-fresh profile",
    ],
    usage: "Steep 1 tea bag in hot water for 4-5 minutes.",
    unitLabel: "20 tea bags",
    price: 329,
    compareAtPrice: 379,
    stock: 84,
    featured: false,
    toneClass: "tone-ginger",
  },
  {
    id: "shatavari-root-powder",
    slug: "shatavari-root-powder",
    name: "Shatavari Root Powder",
    botanicalName: "Asparagus racemosus",
    category: "Herbal Powders",
    shortDescription: "Traditional shatavari powder for daily restorative routines.",
    description:
      "Finely prepared shatavari root powder sourced from quality-tested farm lots. Suitable for warm milk, smoothies, and daily nourishment plans.",
    benefits: [
      "Supports restorative wellness routines",
      "Smooth blendability in warm drinks",
      "No fillers or synthetic additives",
    ],
    usage: "Mix 1/2 tsp in warm milk once daily.",
    unitLabel: "200g jar",
    price: 579,
    compareAtPrice: 649,
    stock: 58,
    featured: true,
    toneClass: "tone-ashwagandha",
  },
  {
    id: "ragi-methi-wellness-mix",
    slug: "ragi-methi-wellness-mix",
    name: "Ragi Methi Wellness Mix",
    botanicalName: "Eleusine coracana blend",
    category: "Functional Foods",
    shortDescription: "Nourishing ragi and methi blend for balanced daily meals.",
    description:
      "A nutrient-forward functional blend made for porridge, roti dough, and breakfast bowls. Crafted for practical wellness with authentic flavor.",
    benefits: [
      "Daily nourishment with functional ingredients",
      "Easy to add to common Indian meals",
      "Balanced earthy flavor profile",
    ],
    usage: "Add 1-2 tbsp in atta, porridge, or smoothie.",
    unitLabel: "300g pouch",
    price: 389,
    stock: 76,
    featured: false,
    toneClass: "tone-moringa",
  },
  {
    id: "kangra-garam-masala",
    slug: "kangra-garam-masala",
    name: "Kangra Garam Masala",
    botanicalName: "Traditional whole-spice blend",
    category: "Spices",
    shortDescription: "Small-batch aromatic garam masala inspired by Himachal kitchens.",
    description:
      "A balanced blend of hand-selected whole spices, roasted and ground in small batches for fresh aroma and deep flavor in daily cooking.",
    benefits: [
      "Rich aroma for curries and sabzis",
      "Freshly ground in small batches",
      "No artificial flavor enhancers",
    ],
    usage: "Add 1/2 tsp towards the end of cooking for best aroma.",
    unitLabel: "120g jar",
    price: 289,
    compareAtPrice: 329,
    stock: 95,
    featured: true,
    toneClass: "tone-turmeric",
  },
  {
    id: "jeera-ajwain-digestive-churna",
    slug: "jeera-ajwain-digestive-churna",
    name: "Jeera Ajwain Digestive Churna",
    botanicalName: "Cuminum cyminum blend",
    category: "Digestive Support",
    shortDescription: "Classic jeera-ajwain blend for digestive ease after meals.",
    description:
      "A functional digestive churna with jeera, ajwain, and mint notes. Built for practical post-meal use and everyday stomach comfort routines.",
    benefits: [
      "Supports smoother post-meal digestion",
      "Balanced taste for regular use",
      "Small-batch blended for consistency",
    ],
    usage: "Take 1/4 tsp after meals with lukewarm water.",
    unitLabel: "140g jar",
    price: 319,
    compareAtPrice: 359,
    stock: 67,
    featured: false,
    toneClass: "tone-neem",
  },
  {
    id: "ashwagandha-calm-capsules",
    slug: "ashwagandha-calm-capsules",
    name: "Ashwagandha Calm Capsules",
    botanicalName: "Withania somnifera extract",
    category: "Capsules",
    shortDescription: "Convenient ashwagandha capsules for stress-balance routines.",
    description:
      "Standardized ashwagandha capsules made for no-prep daily wellness. Ideal for busy schedules and evening recovery support plans.",
    benefits: [
      "Supports calm and stress-balance goals",
      "Simple once-daily format",
      "Travel-friendly bottle pack",
    ],
    usage: "Take 1 capsule after dinner with water.",
    unitLabel: "60 capsules",
    price: 629,
    compareAtPrice: 699,
    stock: 93,
    featured: true,
    toneClass: "tone-triphala",
  },
  {
    id: "nirgundi-joint-comfort-oil",
    slug: "nirgundi-joint-comfort-oil",
    name: "Nirgundi Joint Comfort Oil",
    botanicalName: "Vitex negundo infusion",
    category: "Wellness Oils",
    shortDescription: "Herbal comfort oil for muscle and joint wellness massages.",
    description:
      "A warm nirgundi and sesame-based infusion designed for body massage rituals after long days. Lightweight texture with non-sticky feel.",
    benefits: [
      "Supports comfort-focused massage routines",
      "Traditional nirgundi-inspired formulation",
      "Absorbs well without heavy residue",
    ],
    usage: "Massage gently on target areas 1-2 times daily.",
    unitLabel: "100ml bottle",
    price: 549,
    compareAtPrice: 629,
    stock: 49,
    featured: false,
    toneClass: "tone-brahmi",
  },
  {
    id: "palampur-kahwa-spice-tea",
    slug: "palampur-kahwa-spice-tea",
    name: "Palampur Kahwa Spice Tea",
    botanicalName: "Camellia sinensis spiced blend",
    category: "Himachal Teas",
    shortDescription: "Palampur-inspired kahwa-style tea with warm spice notes.",
    description:
      "A mountain tea blend inspired by Himachal freshness, with gentle spice accents and a clean finish. Perfect for cool-weather tea rituals.",
    benefits: [
      "Distinct hill-origin tea character",
      "Comforting warm spice aroma",
      "Great for morning or evening tea breaks",
    ],
    usage: "Steep 1 tea bag in hot water for 3-4 minutes.",
    unitLabel: "20 tea bags",
    price: 429,
    compareAtPrice: 489,
    stock: 61,
    featured: true,
    toneClass: "tone-ginger",
  },
  {
    id: "lavender-vetiver-sleep-candle",
    slug: "lavender-vetiver-sleep-candle",
    name: "Lavender Vetiver Sleep Candle",
    botanicalName: "Soy wax with lavender and vetiver oils",
    category: "Wellness Candles",
    shortDescription: "Calming aromatherapy candle for evening wind-down routines.",
    description:
      "A clean-burning soy wax candle with lavender and vetiver notes, built for bedtime ambience, journaling sessions, and mindful relaxation.",
    benefits: [
      "Supports relaxing evening environments",
      "Long burn time with clean wax base",
      "Soft natural fragrance for bedrooms and studios",
    ],
    usage: "Burn for 2-3 hours per use. Trim wick before each lighting.",
    unitLabel: "200g glass jar",
    price: 749,
    compareAtPrice: 829,
    stock: 36,
    featured: false,
    toneClass: "tone-turmeric",
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
