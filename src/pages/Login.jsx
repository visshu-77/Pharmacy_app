import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

import AuthShell from "../components/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";

import { loginUser } from "../services/authService";
import { useSubscription } from "../context/SubscriptionContext";
import { useBusiness } from "../context/BusinessContext";
import { useCart } from "../context/CartContext";
import { clearSession } from "../utils/session";

export default function Login() {

    const navigate = useNavigate();
    const toast = useToast();
    const { fetchSubscription } = useSubscription();
    const { syncCartOwner } = useCart();
    const { refresh: refreshBusiness } = useBusiness();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            const result = await loginUser(formData);

            // Drop any leftovers from a previous account (unless it's the same one).
            const previousOwner = localStorage.getItem("cartOwner");
            if (previousOwner && previousOwner !== result.user?.id) {
                clearSession();
            }

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            syncCartOwner();

            await Promise.all([fetchSubscription(), refreshBusiness()]);

            toast.success(
                result.user?.Shopname
                    ? `Welcome back to ${result.user.Shopname}`
                    : "Signed in successfully"
            );

            navigate(result.user?.role === "admin" ? "/admin" : "/", {
                replace: true
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not sign in. Please check your connection and try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted mt-2">
                    Sign in to manage your shop's billing and stock.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate={false}>

                <Input
                    label="Email address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourshop.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <div>
                    <div className="relative">
                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Your password"
                            icon={Lock}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-2 bottom-1.5 grid place-items-center h-8 w-8 rounded-md text-faint hover:text-heading"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="flex justify-end mt-2">
                        <Link
                            to="/forgotPassword"
                            className="text-xs font-semibold text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2.5" role="alert">
                        <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                        <p className="text-sm text-danger">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    iconRight={ArrowRight}
                >
                    Sign in
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
                New to StoreFlow?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                    Set up your shop
                </Link>
            </p>
        </AuthShell>
    );
}
