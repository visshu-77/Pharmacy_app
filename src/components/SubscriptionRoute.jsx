import { Navigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";

export default function SubscriptionRoute({ children }) {

    const {
        subscription,
        subscriptionLoading
    } = useSubscription();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (user?.role === "admin") {
        return children;
    }

    if (subscriptionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking subscription...</p>
            </div>
        );
    }

    if (!subscription) {
        return (
            <Navigate
                to="/subscription"
                replace
            />
        );
    }

    return children;
}
