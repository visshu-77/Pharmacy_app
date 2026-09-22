import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import { getMySubscription } from "../services/subscriptionService";
import { msUntilEnd } from "../utils/subscription";

const SubscriptionContext = createContext(null);

// Re-check the server this often while the app is open, so a plan that
// ends (or a renewal that starts) shows up without a manual refresh.
const REFRESH_EVERY_MS = 5 * 60 * 1000;

export function SubscriptionProvider({ children }) {

    const [subscription, setSubscription] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [accessEndsAt, setAccessEndsAt] = useState(null);
    const [lastEnded, setLastEnded] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);

    // A clock tick so "days left" and the progress bars stay current in a
    // tab left open overnight.
    const [now, setNow] = useState(() => new Date());

    const fetchSubscription = useCallback(async ({ silent = false } = {}) => {
        if (!localStorage.getItem("token")) {
            setSubscription(null);
            setUpcoming([]);
            setAccessEndsAt(null);
            setSubscriptionLoading(false);
            return;
        }

        try {
            if (!silent) setSubscriptionLoading(true);

            const data = await getMySubscription();

            setSubscription(data.hasSubscription ? data.subscription : null);
            setUpcoming(data.upcoming || []);
            setAccessEndsAt(data.accessEndsAt || null);
            setLastEnded(data.lastEnded || null);
        } catch (error) {
            // Keep what we had on a network blip; a 4xx means no plan.
            if (error?.response) {
                setSubscription(null);
                setUpcoming([]);
                setAccessEndsAt(null);
            }
        } finally {
            setSubscriptionLoading(false);
            setNow(new Date());
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    // Periodic refresh + refresh when the owner comes back to the tab.
    useEffect(() => {
        const interval = setInterval(() => fetchSubscription({ silent: true }), REFRESH_EVERY_MS);
        const tick = setInterval(() => setNow(new Date()), 60 * 1000);

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                fetchSubscription({ silent: true });
            }
        };

        document.addEventListener("visibilitychange", onVisible);

        return () => {
            clearInterval(interval);
            clearInterval(tick);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [fetchSubscription]);

    // Re-check the exact moment the current plan ends, so access switches
    // off (or rolls onto a queued renewal) on time.
    useEffect(() => {
        const ms = msUntilEnd(subscription);

        if (ms === null) return undefined;

        const timer = setTimeout(() => fetchSubscription({ silent: true }), ms + 1000);

        return () => clearTimeout(timer);
    }, [subscription, fetchSubscription]);

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                upcoming,
                accessEndsAt,
                lastEnded,
                subscriptionLoading,
                fetchSubscription,
                now
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    return useContext(SubscriptionContext);
}
