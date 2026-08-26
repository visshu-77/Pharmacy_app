import { useLocation } from "react-router-dom";

export default function LastParams(){
    const location = useLocation();
    const lastparams = location.pathname.split("/").filter(Boolean).pop() || "home";
    return(
        <p className="text-sm dark:text-white font-bold">Medibuddy<span className="text-primary dark:text-gray-400 capitalize"> / {lastparams}</span></p>
    )
}