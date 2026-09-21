/**
 * Business type profiles — the heart of StoreFlow's "one app, any shop" model.
 *
 * A profile decides three things for the whole UI:
 *   1. What things are called  ("Medicines" vs "Items" vs "Parts")
 *   2. Which fields are shown  (expiry, batch, warranty, HSN…)
 *   3. Sensible defaults       (units, low-stock threshold, tax, categories)
 *
 * Keep the `id` values in sync with `Backend/config/businessTypes.js`.
 */

import {
    Pill,
    ShoppingBasket,
    Wrench,
    Tv,
    Smartphone,
    NotebookPen,
    Shirt,
    Footprints,
    CakeSlice,
    Sparkles,
    Car,
    Store
} from "lucide-react";

/**
 * Every field the product form can render. A profile lists the ones it wants
 * in `fields`; everything else is hidden for that kind of shop.
 */
export const PRODUCT_FIELDS = {
    SKU: "sku",
    BARCODE: "barcode",
    BRAND: "brand",
    VARIANT: "variant",
    UNIT: "unit",
    MRP: "mrp",
    TAX: "taxRate",
    HSN: "hsnCode",
    EXPIRY: "ExpiryDate",
    BATCH: "batchNumber",
    WARRANTY: "warrantyMonths",
    SUPPLIER: "supplierName"
};

const BASE_FIELDS = [
    PRODUCT_FIELDS.SKU,
    PRODUCT_FIELDS.BARCODE,
    PRODUCT_FIELDS.BRAND,
    PRODUCT_FIELDS.UNIT,
    PRODUCT_FIELDS.MRP,
    PRODUCT_FIELDS.TAX,
    PRODUCT_FIELDS.SUPPLIER
];

const makeProfile = ({
    id,
    label,
    shortLabel,
    icon,
    accent,
    itemLabel,
    itemLabelPlural,
    categoryLabel = "Category",
    categoryLabelPlural = "Categories",
    supplierLabel = "Supplier",
    supplierLabelPlural = "Suppliers",
    exampleShopName,
    fields = [],
    tracksExpiry = false,
    tracksBatch = false,
    licence = null,
    defaultUnit = "piece",
    units = ["piece", "box", "pack"],
    lowStockThreshold = 10,
    defaultTaxRate = 0,
    defaultCategories = [],
    highlights = []
}) => ({
    id,
    label,
    shortLabel: shortLabel || label,
    icon,
    accent,
    itemLabel,
    itemLabelPlural,
    categoryLabel,
    categoryLabelPlural,
    supplierLabel,
    supplierLabelPlural,
    exampleShopName,
    fields: [...new Set([...BASE_FIELDS, ...fields])],
    tracksExpiry,
    tracksBatch,
    licence,
    defaultUnit,
    units,
    lowStockThreshold,
    defaultTaxRate,
    defaultCategories,
    highlights
});

export const BUSINESS_TYPES = [
    makeProfile({
        id: "pharmacy",
        label: "Pharmacy / Medical Store",
        shortLabel: "Pharmacy",
        icon: Pill,
        accent: "#0d9488",
        itemLabel: "Medicine",
        itemLabelPlural: "Medicines",
        exampleShopName: "e.g. City Medical Store",
        fields: [
            PRODUCT_FIELDS.EXPIRY,
            PRODUCT_FIELDS.BATCH,
            PRODUCT_FIELDS.HSN,
            PRODUCT_FIELDS.VARIANT
        ],
        tracksExpiry: true,
        tracksBatch: true,
        licence: {
            key: "licenseNumber",
            label: "Drug Licence No.",
            placeholder: "MH/DRUG/2024/XXXX",
            required: true
        },
        defaultUnit: "strip",
        units: ["strip", "bottle", "tube", "box", "piece", "vial", "sachet"],
        lowStockThreshold: 50,
        defaultTaxRate: 12,
        defaultCategories: [
            "Tablets",
            "Syrups",
            "Injections",
            "Ointments",
            "Drops",
            "Surgical",
            "Baby Care",
            "Supplements"
        ],
        highlights: [
            "Batch and expiry tracking",
            "Expiry alerts 30 days ahead",
            "Drug licence on every invoice"
        ]
    }),

    makeProfile({
        id: "grocery",
        label: "Grocery / Kirana Store",
        shortLabel: "Grocery",
        icon: ShoppingBasket,
        accent: "#16a34a",
        itemLabel: "Item",
        itemLabelPlural: "Items",
        exampleShopName: "e.g. Sharma Kirana Store",
        fields: [PRODUCT_FIELDS.EXPIRY, PRODUCT_FIELDS.VARIANT, PRODUCT_FIELDS.HSN],
        tracksExpiry: true,
        defaultUnit: "kg",
        units: ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bag"],
        lowStockThreshold: 20,
        defaultTaxRate: 5,
        defaultCategories: [
            "Staples & Grains",
            "Pulses",
            "Spices",
            "Oils & Ghee",
            "Snacks",
            "Beverages",
            "Dairy",
            "Personal Care",
            "Household"
        ],
        highlights: [
            "Sell by kg, litre or packet",
            "Best-before date alerts",
            "Fast counter billing"
        ]
    }),

    makeProfile({
        id: "hardware",
        label: "Hardware / Sanitary Store",
        shortLabel: "Hardware",
        icon: Wrench,
        accent: "#ea580c",
        itemLabel: "Item",
        itemLabelPlural: "Items",
        exampleShopName: "e.g. Verma Hardware & Sanitary",
        fields: [PRODUCT_FIELDS.VARIANT, PRODUCT_FIELDS.HSN],
        defaultUnit: "piece",
        units: ["piece", "metre", "foot", "kg", "box", "bundle", "roll", "set"],
        lowStockThreshold: 10,
        defaultTaxRate: 18,
        defaultCategories: [
            "Plumbing",
            "Electrical",
            "Paints",
            "Tools",
            "Fasteners",
            "Sanitaryware",
            "Adhesives",
            "Safety"
        ],
        highlights: [
            "Sell by metre, kg or piece",
            "Size and variant on every item",
            "Supplier-wise purchase tracking"
        ]
    }),

    makeProfile({
        id: "electronics",
        label: "Electronics / Appliances",
        shortLabel: "Electronics",
        icon: Tv,
        accent: "#2563eb",
        itemLabel: "Product",
        itemLabelPlural: "Products",
        exampleShopName: "e.g. Gupta Electronics",
        fields: [
            PRODUCT_FIELDS.WARRANTY,
            PRODUCT_FIELDS.VARIANT,
            PRODUCT_FIELDS.HSN
        ],
        defaultUnit: "piece",
        units: ["piece", "box", "set", "pair"],
        lowStockThreshold: 5,
        defaultTaxRate: 18,
        defaultCategories: [
            "Televisions",
            "Kitchen Appliances",
            "Fans & Coolers",
            "Audio",
            "Cables & Adapters",
            "Batteries",
            "Lighting"
        ],
        highlights: [
            "Warranty months per product",
            "Model and brand tracking",
            "Serial-ready invoices"
        ]
    }),

    makeProfile({
        id: "mobile",
        label: "Mobile & Accessories",
        shortLabel: "Mobile Shop",
        icon: Smartphone,
        accent: "#7c3aed",
        itemLabel: "Product",
        itemLabelPlural: "Products",
        exampleShopName: "e.g. Khan Mobile Point",
        fields: [
            PRODUCT_FIELDS.WARRANTY,
            PRODUCT_FIELDS.VARIANT,
            PRODUCT_FIELDS.HSN
        ],
        defaultUnit: "piece",
        units: ["piece", "box", "pair", "set"],
        lowStockThreshold: 5,
        defaultTaxRate: 18,
        defaultCategories: [
            "Smartphones",
            "Feature Phones",
            "Chargers",
            "Earphones",
            "Covers & Cases",
            "Screen Guards",
            "Power Banks",
            "Memory Cards"
        ],
        highlights: [
            "Warranty and IMEI-ready notes",
            "Accessory-level stock",
            "Quick barcode billing"
        ]
    }),

    makeProfile({
        id: "stationery",
        label: "Stationery & Books",
        shortLabel: "Stationery",
        icon: NotebookPen,
        accent: "#0891b2",
        itemLabel: "Item",
        itemLabelPlural: "Items",
        exampleShopName: "e.g. New Era Stationers",
        fields: [PRODUCT_FIELDS.VARIANT, PRODUCT_FIELDS.HSN],
        defaultUnit: "piece",
        units: ["piece", "packet", "dozen", "box", "ream", "set"],
        lowStockThreshold: 25,
        defaultTaxRate: 12,
        defaultCategories: [
            "Notebooks",
            "Pens & Pencils",
            "Files & Folders",
            "Art Supplies",
            "Office Supplies",
            "School Books",
            "Paper"
        ],
        highlights: [
            "Bulk and dozen pricing",
            "School season stock planning",
            "Fast multi-item bills"
        ]
    }),

    makeProfile({
        id: "clothing",
        label: "Clothing & Apparel",
        shortLabel: "Clothing",
        icon: Shirt,
        accent: "#db2777",
        itemLabel: "Product",
        itemLabelPlural: "Products",
        exampleShopName: "e.g. Trends Fashion Store",
        fields: [PRODUCT_FIELDS.VARIANT, PRODUCT_FIELDS.HSN],
        defaultUnit: "piece",
        units: ["piece", "pair", "set", "metre", "dozen"],
        lowStockThreshold: 5,
        defaultTaxRate: 5,
        defaultCategories: [
            "Men's Wear",
            "Women's Wear",
            "Kids Wear",
            "Ethnic Wear",
            "Winter Wear",
            "Innerwear",
            "Accessories"
        ],
        highlights: [
            "Size and colour as variants",
            "Brand-wise stock",
            "Season-wise reports"
        ]
    }),

    makeProfile({
        id: "footwear",
        label: "Footwear Store",
        shortLabel: "Footwear",
        icon: Footprints,
        accent: "#b45309",
        itemLabel: "Product",
        itemLabelPlural: "Products",
        exampleShopName: "e.g. Step Up Footwear",
        fields: [PRODUCT_FIELDS.VARIANT, PRODUCT_FIELDS.HSN],
        defaultUnit: "pair",
        units: ["pair", "piece", "box"],
        lowStockThreshold: 5,
        defaultTaxRate: 12,
        defaultCategories: [
            "Men's Footwear",
            "Women's Footwear",
            "Kids Footwear",
            "Sports Shoes",
            "Sandals & Slippers",
            "Formal Shoes"
        ],
        highlights: [
            "Size-wise stock",
            "Sell by pair",
            "Brand performance reports"
        ]
    }),

    makeProfile({
        id: "bakery",
        label: "Bakery / Sweets & Namkeen",
        shortLabel: "Bakery",
        icon: CakeSlice,
        accent: "#d97706",
        itemLabel: "Item",
        itemLabelPlural: "Items",
        exampleShopName: "e.g. Agarwal Sweets & Bakery",
        fields: [
            PRODUCT_FIELDS.EXPIRY,
            PRODUCT_FIELDS.BATCH,
            PRODUCT_FIELDS.VARIANT
        ],
        tracksExpiry: true,
        tracksBatch: true,
        defaultUnit: "kg",
        units: ["kg", "g", "piece", "box", "packet", "dozen"],
        lowStockThreshold: 15,
        defaultTaxRate: 5,
        defaultCategories: [
            "Breads",
            "Cakes & Pastries",
            "Cookies",
            "Sweets",
            "Namkeen",
            "Chocolates",
            "Beverages"
        ],
        highlights: [
            "Same-day batch tracking",
            "Sell by weight or piece",
            "Best-before alerts"
        ]
    }),

    makeProfile({
        id: "cosmetics",
        label: "Cosmetics & Beauty",
        shortLabel: "Cosmetics",
        icon: Sparkles,
        accent: "#c026d3",
        itemLabel: "Product",
        itemLabelPlural: "Products",
        exampleShopName: "e.g. Glow Beauty Store",
        fields: [
            PRODUCT_FIELDS.EXPIRY,
            PRODUCT_FIELDS.BATCH,
            PRODUCT_FIELDS.VARIANT,
            PRODUCT_FIELDS.HSN
        ],
        tracksExpiry: true,
        tracksBatch: true,
        defaultUnit: "piece",
        units: ["piece", "bottle", "tube", "box", "packet", "ml", "g"],
        lowStockThreshold: 15,
        defaultTaxRate: 18,
        defaultCategories: [
            "Skin Care",
            "Hair Care",
            "Makeup",
            "Fragrances",
            "Bath & Body",
            "Men's Grooming",
            "Tools & Brushes"
        ],
        highlights: [
            "Shade and size variants",
            "Batch and expiry tracking",
            "Brand-wise margins"
        ]
    }),

    makeProfile({
        id: "autoparts",
        label: "Auto Parts & Service",
        shortLabel: "Auto Parts",
        icon: Car,
        accent: "#475569",
        itemLabel: "Part",
        itemLabelPlural: "Parts",
        exampleShopName: "e.g. Singh Auto Parts",
        fields: [
            PRODUCT_FIELDS.WARRANTY,
            PRODUCT_FIELDS.VARIANT,
            PRODUCT_FIELDS.HSN
        ],
        defaultUnit: "piece",
        units: ["piece", "set", "litre", "box", "pair", "metre"],
        lowStockThreshold: 5,
        defaultTaxRate: 18,
        defaultCategories: [
            "Engine Parts",
            "Brakes & Clutch",
            "Filters",
            "Lubricants",
            "Batteries",
            "Tyres & Tubes",
            "Electricals",
            "Body Parts"
        ],
        highlights: [
            "Part number and fitment notes",
            "Warranty tracking",
            "Supplier-wise purchase"
        ]
    }),

    makeProfile({
        id: "general",
        label: "General Store / Other",
        shortLabel: "General Store",
        icon: Store,
        accent: "#2563eb",
        itemLabel: "Product",
        itemLabelPlural: "Products",
        exampleShopName: "e.g. Krishna General Store",
        fields: [PRODUCT_FIELDS.VARIANT, PRODUCT_FIELDS.HSN],
        defaultUnit: "piece",
        units: [
            "piece",
            "kg",
            "g",
            "litre",
            "ml",
            "packet",
            "box",
            "dozen",
            "metre",
            "pair",
            "set"
        ],
        lowStockThreshold: 10,
        defaultTaxRate: 0,
        defaultCategories: [
            "General",
            "Household",
            "Personal Care",
            "Packaged Food",
            "Stationery",
            "Miscellaneous"
        ],
        highlights: [
            "Works for any kind of shop",
            "Every unit available",
            "Turn features on as you grow"
        ]
    })
];

export const DEFAULT_BUSINESS_TYPE = "general";

export const getBusinessType = (id) =>
    BUSINESS_TYPES.find((type) => type.id === id) ||
    BUSINESS_TYPES.find((type) => type.id === DEFAULT_BUSINESS_TYPE);

/** Does this profile show the given product field? */
export const hasField = (profile, field) =>
    Boolean(profile?.fields?.includes(field));

export default BUSINESS_TYPES;
