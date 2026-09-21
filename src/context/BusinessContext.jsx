import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import { getProfile } from "../services/userService";
import {
    getBusinessType,
    hasField,
    DEFAULT_BUSINESS_TYPE,
    PRODUCT_FIELDS
} from "../config/businessTypes";

const BusinessContext = createContext(null);

const CACHE_KEY = "storeflow.business";

/** Remember the last known profile so the UI is never briefly "wrong". */
const readCache = () => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function BusinessProvider({ children }) {

    const cached = readCache();

    const [user, setUser] = useState(null);
    const [businessTypeId, setBusinessTypeId] = useState(
        cached?.businessType || DEFAULT_BUSINESS_TYPE
    );
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await getProfile();

            if (data?.user) {
                setUser(data.user);
                setBusinessTypeId(
                    data.user.businessType || DEFAULT_BUSINESS_TYPE
                );

                localStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({
                        businessType:
                            data.user.businessType || DEFAULT_BUSINESS_TYPE,
                        shopName: data.user.Shopname
                    })
                );
            }
        } catch (error) {
            // Not signed in, or the API is down — fall back to the cached or
            // default profile rather than blocking the whole app.
            console.log("Business profile unavailable:", error?.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const value = useMemo(() => {

        const profile = getBusinessType(businessTypeId);

        const lowStockThreshold =
            user?.preferences?.lowStockThreshold ?? profile.lowStockThreshold;

        const currency = user?.preferences?.currency || "INR";

        const currencySymbol = currency === "USD" ? "$" : "₹";

        const locale = currency === "USD" ? "en-US" : "en-IN";

        /** ₹1,20,500 — the format shop owners expect on a bill. */
        const formatMoney = (amount, { decimals = 0 } = {}) =>
            `${currencySymbol}${Number(amount || 0).toLocaleString(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}`;

        const formatNumber = (value) =>
            Number(value || 0).toLocaleString(locale);

        /** In Stock / Low Stock / Out of Stock, using this shop's threshold. */
        const getStockStatus = (product) => {
            const stock = Number(product?.stock ?? 0);

            const threshold =
                product?.lowStockThreshold ?? lowStockThreshold;

            if (stock <= 0) {
                return {
                    key: "out",
                    label: "Out of Stock",
                    tone: "danger"
                };
            }

            if (stock <= threshold) {
                return {
                    key: "low",
                    label: "Low Stock",
                    tone: "warning"
                };
            }

            return {
                key: "in",
                label: "In Stock",
                tone: "success"
            };
        };

        /**
         * Expiry state for perishable/regulated stock. Returns null when this
         * business type does not track expiry at all.
         */
        const getExpiryStatus = (product, { warnDays = 30 } = {}) => {
            if (!profile.tracksExpiry || !product?.ExpiryDate) return null;

            const expiry = new Date(product.ExpiryDate);

            if (Number.isNaN(expiry.getTime())) return null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expiry.setHours(0, 0, 0, 0);

            const days = Math.round(
                (expiry - today) / (1000 * 60 * 60 * 24)
            );

            if (days < 0) {
                return { key: "expired", label: "Expired", tone: "danger", days };
            }

            if (days <= warnDays) {
                return {
                    key: "soon",
                    label: days === 0 ? "Expires today" : `${days}d left`,
                    tone: "warning",
                    days
                };
            }

            return { key: "valid", label: "Valid", tone: "success", days };
        };

        return {
            loading,
            user,
            profile,
            businessType: profile.id,

            // Terminology — use these instead of hard-coded words.
            term: {
                item: profile.itemLabel,
                items: profile.itemLabelPlural,
                itemLower: profile.itemLabel.toLowerCase(),
                itemsLower: profile.itemLabelPlural.toLowerCase(),
                category: profile.categoryLabel,
                categories: profile.categoryLabelPlural,
                supplier: profile.supplierLabel,
                suppliers: profile.supplierLabelPlural
            },

            shopName: user?.Shopname || "your shop",
            ownerName: user?.ownerName || "",

            lowStockThreshold,
            currency,
            currencySymbol,

            formatMoney,
            formatNumber,
            getStockStatus,
            getExpiryStatus,

            showField: (field) => hasField(profile, field),
            fields: PRODUCT_FIELDS,

            refresh: load,
            setBusinessType: setBusinessTypeId
        };
    }, [businessTypeId, user, loading, load]);

    return (
        <BusinessContext.Provider value={value}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const context = useContext(BusinessContext);

    if (!context) {
        throw new Error(
            "useBusiness must be used inside a <BusinessProvider>"
        );
    }

    return context;
}

export default BusinessContext;
