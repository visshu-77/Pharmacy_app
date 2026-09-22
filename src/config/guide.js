import {
    Rocket,
    Store,
    Package,
    Tags,
    Truck,
    ReceiptText,
    NotebookPen,
    LayoutDashboard,
    ChartNoAxesCombined,
    Crown,
    Settings2,
    Sparkles
} from "lucide-react";

/**
 * Content for the Guide page. Each topic is a function of the shop's
 * terminology (`t`) so a pharmacy reads "medicines" and a hardware store
 * reads "items".
 *
 * Every step describes what the app really does — keep it in sync when a
 * feature changes.
 */
export const buildGuideTopics = (t) => [
    {
        id: "getting-started",
        cta: "Go to dashboard",
        title: "Getting started",
        icon: Rocket,
        path: "/",
        summary: "Set up your shop and make your first sale in a few minutes.",
        steps: [
            `Open Settings → Business and check your shop name, address, GST number and UPI ID. These are printed on every invoice.`,
            `Look at your ${t.categories.toLowerCase()} — StoreFlow created starter ones for your type of shop. Rename, add or delete them as you like.`,
            `Add your ${t.itemsLower}: one at a time from the ${t.items} page, or all at once with Import CSV.`,
            `Make your first bill from New Bill, or jot quick sales in the Sales Note.`,
            `Check the Dashboard at the end of the day to see today's revenue and anything that needs attention.`
        ],
        tips: [
            "Stuck anywhere? Open this Guide from the sidebar — or ask the AI assistant at the bottom-right.",
            "You can switch between light and dark mode from the bottom of the sidebar."
        ]
    },
    {
        id: "business-type",
        cta: "Open settings",
        title: "Your type of business",
        icon: Store,
        path: "/settings",
        summary: "StoreFlow adapts its fields, units and alerts to your kind of shop.",
        steps: [
            "Go to Settings → Business → Type of business.",
            "Pick your shop type: pharmacy, grocery, hardware, electronics, mobile, stationery, clothing, footwear, bakery, cosmetics, auto parts or general store.",
            "StoreFlow changes what things are called, which fields appear on each item (expiry, batch, warranty…) and which units you can sell in (kg, metre, strip, pair…).",
            "Set your low stock alert level and default GST rate under Inventory defaults."
        ],
        tips: [
            "Switching type never deletes anything — your items, bills and reports stay exactly as they are.",
            "A pharmacy needs a drug licence number; for other shops the licence is optional."
        ]
    },
    {
        id: "products",
        title: `${t.items} & stock`,
        icon: Package,
        path: "/product",
        summary: `Add ${t.itemsLower}, track stock and get warned before you run out.`,
        steps: [
            `Click Add ${t.itemLower}. Enter the name, ${t.category.toLowerCase()}, stock and selling price — everything else is optional.`,
            "Add the purchase price to see your margin on every item, and a barcode or SKU to find it instantly at the counter.",
            "Set a “Low stock alert at” level per item, or leave it blank to use your shop-wide default.",
            `To bring an existing list, use Import CSV. Columns: Product, SKU, Barcode, Brand, Variant, Category, Unit, Stock, Purchase, Selling, MRP, TaxRate, HSN, Supplier, Batch, Expiry, WarrantyMonths. Missing ${t.categories.toLowerCase()} are created for you.`,
            "Use Filters to see only low stock, out of stock or expiring items. Export gives you a CSV you can re-import."
        ],
        tips: [
            "Stock goes down automatically with every bill and every Sales Note line — you never need to adjust it by hand after a sale.",
            "Tick several rows to delete them together."
        ]
    },
    {
        id: "categories",
        title: t.categories,
        icon: Tags,
        path: "/category",
        summary: `Group your ${t.itemsLower} so they're easy to find and report on.`,
        steps: [
            `Open ${t.categories} and click New ${t.category.toLowerCase()}.`,
            "Pick one of the suggested names for your type of shop, or type your own.",
            `Click a ${t.category.toLowerCase()} card to see every ${t.itemLower} in it, with total stock and stock value.`
        ],
        tips: [
            `Deleting a ${t.category.toLowerCase()} doesn't delete its ${t.itemsLower} — they just lose their grouping.`,
            `Reports show sales per ${t.category.toLowerCase()}, so good grouping gives better insight.`
        ]
    },
    {
        id: "suppliers",
        title: t.suppliers,
        icon: Truck,
        path: "/suppliers",
        summary: "Keep contacts and GST details of the people you buy from.",
        steps: [
            `Click Add ${t.supplier.toLowerCase()} and enter the firm name and phone. Email, address and GST are optional.`,
            `When adding an ${t.itemLower}, start typing in the ${t.supplier} field to pick from your list.`,
            "Import or export your supplier list as CSV (columns: Supplier Name, Phone, Email, Address, City, State, GST Number)."
        ],
        tips: []
    },
    {
        id: "billing",
        cta: "Make a bill",
        title: "Billing at the counter",
        icon: ReceiptText,
        path: "/billing",
        summary: "Fast bills with barcode search, discounts, GST and UPI QR.",
        steps: [
            "Open New Bill. The search box is ready — scan a barcode or type a name and press Enter. Press / to jump back to search any time.",
            "Change quantities with + / − or type an exact amount — decimals work for loose goods (1.5 kg, 2.5 m).",
            "Add a discount as ₹ or %. Tick “Add GST” to add tax from each item's GST rate.",
            "Choose Cash (enter cash received to see the change), UPI (shows a QR for your UPI ID) or Card.",
            "Click Save bill. Then print the invoice or send it on WhatsApp.",
            "Customer name and mobile are optional — leave them empty for walk-in customers."
        ],
        tips: [
            "Add your UPI ID in Settings → Business to show a payable QR.",
            `You can also add ${t.itemsLower} to the bill from the ${t.items} page with the cart button.`
        ]
    },
    {
        id: "sales-note",
        cta: "Open sales note",
        title: "Sales Note",
        icon: NotebookPen,
        path: "/notes",
        summary: "No time for a bill? Jot the sale down — stock still updates.",
        steps: [
            `Open Sales Note from the sidebar. Scan or type the ${t.itemLower} and pick it from the list — you'll see how much is in stock.`,
            "Enter the quantity, change the price if needed, choose Cash / UPI / Card and press Add (or Enter).",
            `Stock comes off the ${t.itemLower} immediately. Made a mistake? Edit the line (stock adjusts by the difference) or delete it (stock goes back).`,
            "At the end of the day, see total noted sales, the cash / UPI / card split, and what sold per item. Print summary gives you a paper copy.",
            "Use the date arrows to look back at any earlier day."
        ],
        tips: [
            "Noted sales count as real sales — they appear in your Dashboard revenue and Reports automatically.",
            "The day total adds your noted sales and your proper bills together."
        ]
    },
    {
        id: "dashboard",
        cta: "Open dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
        summary: "Your shop at a glance, every time you open StoreFlow.",
        steps: [
            "The top shows today's revenue, bills today, this month and this year.",
            "Below that: total items, stock value at cost, categories and suppliers.",
            "The sales chart shows the last 14 days.",
            "“Needs attention” lists low stock, out of stock and — for shops that track it — expiring and expired items. Click one to go straight to the list."
        ],
        tips: []
    },
    {
        id: "reports",
        cta: "Open reports",
        title: "Reports",
        icon: ChartNoAxesCombined,
        path: "/reports",
        summary: "See how your shop is really doing.",
        steps: [
            "Pick a period at the top: today, this week, last 30 days, this month, last month or this year.",
            "The cards show total sales, number of bills, average bill and units sold for that period; the chart shows sales per day.",
            "Top selling items can be sorted by units or by revenue. Category performance shows which groups earn most.",
            "Transactions lists every bill (including Sales Note lines) and your plan payments, with filters.",
            "Export CSV downloads your sales for your accountant."
        ],
        tips: []
    },
    {
        id: "plan",
        cta: "See plan",
        title: "Your plan",
        icon: Crown,
        path: "/subscription",
        summary: "One plan with everything included.",
        steps: [
            "StoreFlow Pro includes every feature. Choose monthly, 6-month or yearly billing — longer periods cost less per month.",
            "Pay securely with UPI, card, net banking or wallet through Razorpay.",
            "The sidebar shows how many days are left. You'll get a reminder when you log in during the last 7 days.",
            "Renewing early loses nothing — the new period starts right after the current one ends."
        ],
        tips: [
            "If your plan ends, your data is never deleted. Renew any time and everything is back as you left it."
        ]
    },
    {
        id: "settings",
        cta: "Open settings",
        title: "Settings",
        icon: Settings2,
        path: "/settings",
        summary: "Shop details, account, notifications and preferences.",
        steps: [
            "Business: shop details, type of business, UPI ID and inventory defaults.",
            "Profile: your name, email and mobile.",
            "Preferences: language (English / Hindi), currency, date format and light / dark theme.",
            "Notifications: choose which alerts you want.",
            "Security: change your password.",
            "Subscription and Plan payments: your current plan and payment history."
        ],
        tips: []
    },
    {
        id: "assistant",
        title: "AI assistant",
        icon: Sparkles,
        path: null,
        summary: "Ask questions about your shop in plain language.",
        steps: [
            "Click Ask AI at the bottom-right of any page.",
            "Ask things like “How much did I sell today?” or “Which items are running low?”, or tap one of the suggestions.",
            "Answers come only from your own shop's data."
        ],
        tips: []
    }
];

export const buildGuideFaqs = (t) => [
    {
        q: "Will I lose my data if my plan ends?",
        a: "No. Nothing is deleted when a plan ends — access is only paused. Renew and all your items, bills and reports are back."
    },
    {
        q: "What's the difference between New Bill and Sales Note?",
        a: "New Bill makes a proper invoice with customer details, discount, GST and printing. Sales Note is a quick list for busy moments — no invoice, but stock and sales totals are updated exactly the same way."
    },
    {
        q: `Why is my ${t.itemLower} showing “Low stock”?`,
        a: `Its stock is at or below the low stock level — either the one set on that ${t.itemLower}, or your shop default in Settings → Business → Inventory defaults.`
    },
    {
        q: "Can I sell half a kilo or 2.5 metres?",
        a: "Yes. Quantities can have decimals in both New Bill and Sales Note."
    },
    {
        q: "How do I show a UPI QR code on bills?",
        a: "Add your UPI ID in Settings → Business. The Billing screen then shows a QR with the exact amount when you choose UPI."
    },
    {
        q: "Can I change my type of business later?",
        a: "Yes, from Settings → Business. Labels and fields change; your data stays."
    },
    {
        q: "Two people sold the last piece at the same time — what happens?",
        a: "Only one sale goes through; the other gets a “not enough stock” message. Stock can never go below zero."
    }
];
