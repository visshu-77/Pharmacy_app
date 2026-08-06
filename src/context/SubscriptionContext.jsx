import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


import { getMySubscription } from "../services/subscriptionService";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {

    const [subscription, setSubscription] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);

    const fetchSubscription = async () => {
        try {

            const data = await getMySubscription();
            console.log("UPDATED SUBSCRIPTION", data);

            if (data.hasSubscription) {
                setSubscription(data.subscription);
            } else {
                setSubscription(null);
            }

        } catch (error) {

            console.log("Subscription error:", error);
            setSubscription(null);

        } finally {

            setSubscriptionLoading(false);

        }
    };

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (token) {
            fetchSubscription();
        } else {
            setSubscriptionLoading(false);
        }

    }, []);

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                subscriptionLoading,
                fetchSubscription
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    return useContext(SubscriptionContext);
}