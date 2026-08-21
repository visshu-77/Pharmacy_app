import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ProtectedRoute({ children }) {

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {

        const verifyToken = async () => {

            const token = localStorage.getItem("token");

            console.log("TOKEN IS ======>", token);

            if (!token) {
                setValid(false);
                setLoading(false);
                return;
            }

            try {

                const response = await api.get(
                    "/api/verify",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("VERIFY SUCCESS:", response.data);

                setValid(true);

            } catch (err) {

                console.log("VERIFY FAILED");
                console.log("Status:", err.response?.status);
                console.log("Response:", err.response?.data);
                console.log("Error:", err.message);

                // Only remove token if backend says it is unauthorized
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                }

                setValid(false);

            } finally {
                setLoading(false);
            }
        };

        verifyToken();

    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return valid
        ? children
        : <Navigate to="/login" replace />;
}