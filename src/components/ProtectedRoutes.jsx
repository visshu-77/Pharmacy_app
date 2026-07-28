import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProtectedRoute({children}) {

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {

        const verifyToken = async () => {

            const token = localStorage.getItem("token");

            if(!token){
                setValid(false);
                setLoading(false);
                return;
            }

            try {

                await axios.get(
                    "http://localhost:5000/api/verify",
                    {
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                );

                setValid(true);

            } catch(err){

                localStorage.removeItem("token");
                setValid(false);

            }

            setLoading(false);
        };

        verifyToken();

    }, []);


    if(loading){
        return <p>Loading...</p>;
    }


    return valid 
        ? children 
        : <Navigate to="/login" replace />;
}