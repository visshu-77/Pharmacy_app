import { Navigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";

export default function SubscriptionRoute({ children }) {

    const {
        subscription,
        subscriptionLoading
    } = useSubscription();

    if (subscriptionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking subscription...</p>
            </div>
        );
    }

    if (!subscription) {
        return <Navigate to="/subscription" replace />;
    }

    return children;
}