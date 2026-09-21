import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, LifeBuoy } from "lucide-react";

import AuthShell from "../components/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";

import BRAND from "../config/brand";

/**
 * Password recovery. There is no self-serve reset endpoint on the server yet,
 * so this screen routes the owner to support instead of pretending to send
 * an OTP.
 */
export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const mailto = `mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(
        "Password reset request"
    )}&body=${encodeURIComponent(
        `Please help me reset the password for my ${BRAND.name} account: ${email}`
    )}`;

    return (
        <AuthShell>
            <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
            </Link>

            <div className="mt-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Reset your password
                </h1>
                <p className="text-sm text-muted mt-2">
                    Enter the email you registered with and we'll help you get back in.
                </p>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <Input
                        label="Email address"
                        type="email"
                        placeholder="you@yourshop.com"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button type="submit" size="lg" fullWidth>
                        Continue
                    </Button>
                </form>
            ) : (
                <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
                    <div className="flex items-start gap-3">
                        <span className="grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary">
                            <LifeBuoy className="h-5 w-5" />
                        </span>

                        <div>
                            <p className="font-semibold text-heading">
                                Contact support to reset
                            </p>
                            <p className="text-sm text-muted mt-1 leading-relaxed">
                                Self-service reset is not available yet. Email our
                                team from <span className="font-medium text-heading">{email}</span> and
                                we'll verify your shop and reset it for you.
                            </p>
                        </div>
                    </div>

                    <Button href={mailto} fullWidth className="mt-5">
                        Email {BRAND.supportEmail}
                    </Button>
                </div>
            )}

            <p className="mt-8 text-center text-sm text-muted">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                    Set up your shop
                </Link>
            </p>
        </AuthShell>
    );
}
