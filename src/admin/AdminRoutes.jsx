import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {

    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {

        const decoded = jwtDecode(token);

        console.log("ADMIN ROUTE USER:", decoded);

        if (decoded.role !== "admin") {

            return (
                <Navigate
                    to="/"
                    replace
                />
            );

        }

        return children;

    } catch (error) {

        console.log("Admin token decode error:", error);

        localStorage.removeItem("token");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }
}
