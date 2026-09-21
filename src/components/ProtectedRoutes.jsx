import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { api } from "../services/api";
import { LogoMark } from "./brand/Logo";

/** Full-screen splash while the session is being verified. */
export function AppSplash() {
    return (
        <div className="min-h-screen grid place-items-center bg-canvas">
            <div className="flex flex-col items-center gap-4">
                <LogoMark className="h-12 w-12 animate-pulse" />
                <div className="h-1 w-32 overflow-hidden rounded-full bg-line">
                    <div className="h-full w-1/2 rounded-full bg-primary animate-[shimmer_1.2s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    );
}

export default function ProtectedRoute({ children }) {

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {

        const verifyToken = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                setValid(false);
                setLoading(false);
                return;
            }

            try {
                await api.get("/api/verify", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setValid(true);

            } catch (err) {

                // Only drop the token when the server says it is invalid —
                // a network blip should not sign the owner out mid-sale.
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
        return <AppSplash />;
    }

    return valid
        ? children
        : <Navigate to="/login" replace />;
}
