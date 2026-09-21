import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Logo from "../components/brand/Logo";

export default function PageNotFound() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-canvas">
            <div className="px-6 pt-6">
                <Logo size="sm" />
            </div>

            <div className="flex-1 grid place-items-center px-6">
                <div className="text-center max-w-md">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Error 404</p>
                    <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">This shelf is empty</h1>
                    <p className="mt-4 text-muted">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Go back</Button>
                        <Button to="/" icon={Home}>Dashboard</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
