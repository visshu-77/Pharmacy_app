import { useEffect, useRef, useState } from "react";
import { ScanBarcode, Plus, X, Loader2 } from "lucide-react";

import Badge from "../ui/Badge";
import { useToast } from "../ui/Toast";

import { searchProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useBusiness } from "../../context/BusinessContext";

/**
 * Counter search box. Works with typing and with USB barcode scanners (which
 * type the code and press Enter): Enter adds the exact barcode/SKU match, or
 * the highlighted result.
 */
export default function ProductSearch() {

    const toast = useToast();
    const { addToCart } = useCart();
    const { term, formatMoney, getStockStatus } = useBusiness();

    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    const inputRef = useRef(null);

    // "/" focuses the search from anywhere on the billing screen.
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const q = search.trim();

        if (!q) {
            setResults([]);
            setOpen(false);
            return undefined;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const data = await searchProducts(q);
                setResults(data.products || []);
                setActive(0);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [search]);

    const add = (product) => {
        if (!product) return;

        if (Number(product.stock) <= 0) {
            toast.warning(`${product.productName} is out of stock`);
            return;
        }

        addToCart(product);
        setSearch("");
        setResults([]);
        setOpen(false);
        inputRef.current?.focus();
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const q = search.trim().toLowerCase();
            const exact = results.find(
                (p) => p.barcode?.toLowerCase() === q || p.sku?.toLowerCase() === q
            );
            add(exact || results[active]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <ScanBarcode className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />

                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => results.length && setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    placeholder={`Scan barcode or search ${term.itemsLower}…`}
                    className="w-full h-14 pl-12 pr-24 rounded-xl border-2 border-line bg-surface text-base text-heading shadow-xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition"
                    aria-label={`Search ${term.itemsLower}`}
                    autoComplete="off"
                    autoFocus
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-faint" />}
                    {search ? (
                        <button
                            type="button"
                            onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                            className="grid place-items-center h-7 w-7 rounded-md text-faint hover:bg-surface-hover hover:text-heading"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-flex h-6 items-center rounded border border-line bg-surface-muted px-1.5 text-[11px] font-semibold text-faint">
                            /
                        </kbd>
                    )}
                </div>
            </div>

            {open && search.trim() && (
                <div className="absolute z-30 left-0 right-0 mt-2 rounded-xl border border-line bg-surface shadow-lg overflow-hidden animate-fade-in">
                    {results.length === 0 && !loading ? (
                        <p className="px-4 py-6 text-center text-sm text-muted">
                            No {term.itemsLower} match "{search.trim()}"
                        </p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto thin-scrollbar divide-y divide-line" role="listbox">
                            {results.map((product, index) => {
                                const status = getStockStatus(product);
                                const disabled = status.key === "out";
                                return (
                                    <li key={product._id} role="option" aria-selected={index === active}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onMouseEnter={() => setActive(index)}
                                            onClick={() => add(product)}
                                            disabled={disabled}
                                            className={[
                                                "w-full flex items-center gap-4 px-4 py-3 text-left transition-colors",
                                                index === active ? "bg-primary/5" : "",
                                                disabled ? "opacity-50 cursor-not-allowed" : ""
                                            ].join(" ")}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-heading truncate">{product.productName}</p>
                                                <p className="text-xs text-muted truncate">
                                                    {[product.brand, product.variant, product.productCategory?.categoryName, product.barcode].filter(Boolean).join(" · ") || "—"}
                                                </p>
                                            </div>

                                            <Badge tone={status.tone} size="sm">
                                                {Number(product.stock)} {product.unit}
                                            </Badge>

                                            <span className="w-24 text-right font-bold text-heading tabular">
                                                {formatMoney(product.sellingPrice, { decimals: 2 })}
                                            </span>

                                            <span className={`grid place-items-center h-8 w-8 rounded-lg ${index === active ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                                <Plus className="h-4 w-4" />
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <p className="hidden sm:block border-t border-line bg-surface-muted px-4 py-2 text-[11px] text-faint">
                        ↑ ↓ to move · Enter to add · Esc to close
                    </p>
                </div>
            )}
        </div>
    );
}
