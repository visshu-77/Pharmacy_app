import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Store,
    User,
    Phone,
    Mail,
    MapPin,
    Lock,
    Building2,
    Map as MapIcon,
    FileText,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Check,
    AlertCircle
} from "lucide-react";

import AuthShell from "../components/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";

import { registerUser } from "../services/authService";
import { BUSINESS_TYPES, getBusinessType } from "../config/businessTypes";
import BRAND from "../config/brand";

const STEPS = [
    { id: 1, title: "Your business", short: "Business" },
    { id: 2, title: "Shop details", short: "Shop" },
    { id: 3, title: "Your account", short: "Account" }
];

const INITIAL_FORM = {
    businessType: "",
    Shopname: "",
    shopAddress: "",
    city: "",
    state: "",
    gstNumber: "",
    licenseNumber: "",
    ownerName: "",
    mobileNumber: "",
    email: "",
    Password: "",
    confirmPassword: ""
};

function Stepper({ step }) {
    return (
        <ol className="flex items-center gap-2" aria-label="Registration progress">
            {STEPS.map((item, index) => {
                const done = step > item.id;
                const active = step === item.id;

                return (
                    <li key={item.id} className="flex items-center gap-2 flex-1 last:flex-none">
                        <div className="flex items-center gap-2">
                            <span
                                className={[
                                    "grid place-items-center h-7 w-7 rounded-full text-xs font-bold transition-colors",
                                    done
                                        ? "bg-primary text-white"
                                        : active
                                            ? "bg-primary/10 text-primary ring-2 ring-primary"
                                            : "bg-surface-hover text-faint"
                                ].join(" ")}
                                aria-current={active ? "step" : undefined}
                            >
                                {done ? <Check className="h-3.5 w-3.5" /> : item.id}
                            </span>

                            <span
                                className={[
                                    "text-xs font-semibold hidden xs:inline",
                                    active || done ? "text-heading" : "text-faint"
                                ].join(" ")}
                            >
                                {item.short}
                            </span>
                        </div>

                        {index < STEPS.length - 1 && (
                            <span
                                className={[
                                    "h-px flex-1 transition-colors",
                                    done ? "bg-primary" : "bg-line"
                                ].join(" ")}
                                aria-hidden="true"
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export default function Register() {

    const navigate = useNavigate();
    const toast = useToast();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const profile = useMemo(
        () => (formData.businessType ? getBusinessType(formData.businessType) : null),
        [formData.businessType]
    );

    const setField = (name, value) => {
        setFormData((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
        setServerError("");
    };

    const handleChange = (e) => setField(e.target.name, e.target.value);

    const validateStep = (target) => {
        const next = {};

        if (target === 1 && !formData.businessType) {
            next.businessType = "Choose the kind of shop you run";
        }

        if (target === 2) {
            if (!formData.Shopname.trim()) next.Shopname = "Shop name is required";
            if (!formData.shopAddress.trim()) next.shopAddress = "Address is required";
            if (!formData.city.trim()) next.city = "City is required";
            if (!formData.state.trim()) next.state = "State is required";

            if (
                formData.gstNumber &&
                !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(formData.gstNumber.trim())
            ) {
                next.gstNumber = "That doesn't look like a valid 15-character GSTIN";
            }

            if (profile?.licence?.required && !formData.licenseNumber.trim()) {
                next.licenseNumber = `${profile.licence.label} is required`;
            }
        }

        if (target === 3) {
            if (!formData.ownerName.trim()) next.ownerName = "Your name is required";

            if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
                next.mobileNumber = "Enter a valid 10-digit mobile number";
            }

            if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                next.email = "Enter a valid email address";
            }

            if (formData.Password.length < 8) {
                next.Password = "Use at least 8 characters";
            }

            if (formData.confirmPassword !== formData.Password) {
                next.confirmPassword = "Passwords do not match";
            }

            if (!agreed) {
                next.agreed = "Please accept the terms to continue";
            }
        }

        setErrors(next);

        return Object.keys(next).length === 0;
    };

    const goNext = () => {
        if (validateStep(step)) setStep((current) => current + 1);
    };

    const goBack = () => setStep((current) => Math.max(1, current - 1));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step < 3) {
            goNext();
            return;
        }

        if (!validateStep(3)) return;

        try {
            setSubmitting(true);
            setServerError("");

            await registerUser({
                ...formData,
                gstNumber: formData.gstNumber.trim().toUpperCase()
            });

            toast.success(
                `${formData.Shopname} is set up with starter ${profile.categoryLabelPlural.toLowerCase()}. Sign in to continue.`,
                { title: "Account created" }
            );

            navigate("/login", { replace: true });

        } catch (err) {
            setServerError(
                err?.response?.data?.message ||
                "Could not create your account. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell wide>
            <div className="flex items-center justify-between gap-4">
                {step === 1 ? (
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Sign in instead
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                )}

                <span className="text-xs text-faint font-medium">
                    Step {step} of {STEPS.length}
                </span>
            </div>

            <div className="mt-6">
                <Stepper step={step} />
            </div>

            <div className="mt-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {step === 1 && "What kind of shop do you run?"}
                    {step === 2 && "Tell us about your shop"}
                    {step === 3 && "Create your owner account"}
                </h1>

                <p className="text-sm text-muted mt-2">
                    {step === 1 &&
                        `${BRAND.name} adapts its fields, units and alerts to your business. You can change this later in Settings.`}
                    {step === 2 &&
                        "These details appear on every invoice you print."}
                    {step === 3 &&
                        "You'll use this to sign in and receive important alerts."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">

                {/* ---------------- Step 1: business type ---------------- */}
                {step === 1 && (
                    <div>
                        <div
                            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                            role="radiogroup"
                            aria-label="Business type"
                        >
                            {BUSINESS_TYPES.map((type) => {
                                const Icon = type.icon;
                                const selected = formData.businessType === type.id;

                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => setField("businessType", type.id)}
                                        className={[
                                            "relative text-left rounded-xl border p-3.5 transition-all duration-150",
                                            selected
                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                                : "border-line bg-surface hover:border-line-strong hover:shadow-sm"
                                        ].join(" ")}
                                    >
                                        {selected && (
                                            <span className="absolute top-2.5 right-2.5 grid place-items-center h-5 w-5 rounded-full bg-primary text-white">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}

                                        <span
                                            className="grid place-items-center h-10 w-10 rounded-xl text-white"
                                            style={{ backgroundColor: type.accent }}
                                        >
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </span>

                                        <p className="mt-3 text-sm font-semibold text-heading leading-snug">
                                            {type.shortLabel}
                                        </p>

                                        <p className="text-[11px] text-muted mt-0.5 line-clamp-1">
                                            {type.highlights[0]}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {errors.businessType && (
                            <p className="flex items-center gap-1.5 text-sm text-danger mt-3">
                                <AlertCircle className="h-4 w-4" />
                                {errors.businessType}
                            </p>
                        )}

                        {profile && (
                            <div className="mt-5 rounded-xl border border-line bg-surface p-4 animate-fade-in">
                                <p className="text-xs font-semibold uppercase tracking-wider text-faint">
                                    Set up for {profile.shortLabel}
                                </p>

                                <ul className="mt-3 grid sm:grid-cols-3 gap-2">
                                    {profile.highlights.map((highlight) => (
                                        <li key={highlight} className="flex items-start gap-2 text-sm text-body">
                                            <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>

                                <p className="mt-3 text-xs text-muted">
                                    We'll create {profile.defaultCategories.length} starter{" "}
                                    {profile.categoryLabelPlural.toLowerCase()}:{" "}
                                    {profile.defaultCategories.slice(0, 4).join(", ")}
                                    {profile.defaultCategories.length > 4 ? "…" : ""}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ---------------- Step 2: shop details ---------------- */}
                {step === 2 && profile && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            className="sm:col-span-2"
                            label="Shop name"
                            name="Shopname"
                            icon={Store}
                            placeholder={profile.exampleShopName}
                            value={formData.Shopname}
                            onChange={handleChange}
                            error={errors.Shopname}
                            required
                        />

                        <Input
                            className="sm:col-span-2"
                            label="Shop address"
                            name="shopAddress"
                            icon={MapPin}
                            placeholder="Shop no., street, area"
                            value={formData.shopAddress}
                            onChange={handleChange}
                            error={errors.shopAddress}
                            required
                        />

                        <Input
                            label="City"
                            name="city"
                            icon={Building2}
                            placeholder="e.g. Indore"
                            value={formData.city}
                            onChange={handleChange}
                            error={errors.city}
                            required
                        />

                        <Input
                            label="State"
                            name="state"
                            icon={MapIcon}
                            placeholder="e.g. Madhya Pradesh"
                            value={formData.state}
                            onChange={handleChange}
                            error={errors.state}
                            required
                        />

                        <Input
                            label="GST number"
                            name="gstNumber"
                            icon={FileText}
                            placeholder="22AAAAA0000A1Z5"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            error={errors.gstNumber}
                            hint="Optional — leave blank if you're not GST registered"
                            maxLength={15}
                        />

                        {profile.licence ? (
                            <Input
                                label={profile.licence.label}
                                name="licenseNumber"
                                icon={ShieldCheck}
                                placeholder={profile.licence.placeholder}
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                error={errors.licenseNumber}
                                required={profile.licence.required}
                            />
                        ) : (
                            <Input
                                label="Trade licence no."
                                name="licenseNumber"
                                icon={ShieldCheck}
                                placeholder="Optional"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                hint="Shop & establishment, FSSAI or any other licence"
                            />
                        )}
                    </div>
                )}

                {/* ---------------- Step 3: owner account ---------------- */}
                {step === 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            className="sm:col-span-2"
                            label="Owner name"
                            name="ownerName"
                            icon={User}
                            placeholder="Your full name"
                            autoComplete="name"
                            value={formData.ownerName}
                            onChange={handleChange}
                            error={errors.ownerName}
                            required
                        />

                        <Input
                            label="Mobile number"
                            name="mobileNumber"
                            type="tel"
                            inputMode="numeric"
                            icon={Phone}
                            placeholder="10-digit mobile"
                            autoComplete="tel-national"
                            maxLength={10}
                            value={formData.mobileNumber}
                            onChange={(e) => setField("mobileNumber", e.target.value.replace(/\D/g, ""))}
                            error={errors.mobileNumber}
                            required
                        />

                        <Input
                            label="Email address"
                            name="email"
                            type="email"
                            icon={Mail}
                            placeholder="you@yourshop.com"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Password"
                            name="Password"
                            type="password"
                            icon={Lock}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            value={formData.Password}
                            onChange={handleChange}
                            error={errors.Password}
                            required
                        />

                        <Input
                            label="Confirm password"
                            name="confirmPassword"
                            type="password"
                            icon={Lock}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />

                        <label className="sm:col-span-2 flex items-start gap-2.5 mt-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => {
                                    setAgreed(e.target.checked);
                                    setErrors((current) => ({ ...current, agreed: undefined }));
                                }}
                                className="mt-0.5 h-4 w-4 shrink-0"
                            />
                            <span className="text-sm text-muted leading-relaxed">
                                I agree to {BRAND.name}'s{" "}
                                <Link to="#" className="font-medium text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link to="#" className="font-medium text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>

                        {errors.agreed && (
                            <p className="sm:col-span-2 -mt-2 text-xs text-danger">
                                {errors.agreed}
                            </p>
                        )}
                    </div>
                )}

                {serverError && (
                    <div className="mt-5 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2.5" role="alert">
                        <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                        <p className="text-sm text-danger">{serverError}</p>
                    </div>
                )}

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-muted text-center sm:text-left">
                        Already registered?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>

                    <Button
                        type="submit"
                        size="lg"
                        loading={submitting}
                        iconRight={ArrowRight}
                        className="sm:min-w-[180px]"
                    >
                        {step < 3 ? "Continue" : "Create account"}
                    </Button>
                </div>
            </form>
        </AuthShell>
    );
}
