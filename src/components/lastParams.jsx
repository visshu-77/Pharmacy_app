import { useLocation } from "react-router-dom";

export default function LastParams(){
    const location = useLocation();
    const lastparams = location.pathname.split("/").filter(Boolean).pop() || "home";
    return(
        <p className="text-sm font-bold">Medibuddy<span className="text-primary capitalize"> / {lastparams}</span></p>
    )
}