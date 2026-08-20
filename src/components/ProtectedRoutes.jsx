import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function ProtectedRoute({ children }) {

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {

        const verifyToken = async () => {

            const token = localStorage.getItem("token");

            console.log("API IS ======>", API);
            console.log("OKEN IS ======>", token);

            if (!token) {
                setValid(false);
                setLoading(false);
                return;
            }

            try {

               const response = await axios.get(
                    `${API}/api/verify`,
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
                localStorage.removeItem("token");
                setValid(false);

            }

            setLoading(false);
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