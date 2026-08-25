import { Navigate } from "react-router-dom";

export default function UserRoute({ children }) {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin should never access normal user pages
    if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return children;
}