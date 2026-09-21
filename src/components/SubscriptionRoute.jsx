import { Navigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";
import { Spinner } from "./ui/State";

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
        return <Spinner label="Checking your plan…" className="min-h-[60vh]" />;
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
