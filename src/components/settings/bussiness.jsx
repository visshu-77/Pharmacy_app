import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Store,
    FileText,
    ShieldCheck,
    Building2,
    Map as MapIcon,
    Smartphone,
    Save,
    Check,
    PackageMinus,
    Percent,
    Info
} from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Field";
import { Spinner } from "../ui/State";
import { ConfirmDialog } from "../ui/Modal";
import { useToast } from "../ui/Toast";

import { updateProfile, getProfile, getPreferences, updatePreferences } from "../../services/userService";
import { BUSINESS_TYPES, getBusinessType } from "../../config/businessTypes";
import { useBusiness } from "../../context/BusinessContext";

export default function BussinessSettings() {

    const { t } = useTranslation();
    const toast = useToast();
    const { refresh } = useBusiness();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingType, setSavingType] = useState(false);
    const [savingDefaults, setSavingDefaults] = useState(false);

    const [savedType, setSavedType] = useState("general");
    const [pendingType, setPendingType] = useState(null);

    const [formData, setFormData] = useState({
        Shopname: "",
        shopAddress: "",
        city: "",
        state: "",
        gstNumber: "",
        licenseNumber: "",
        upiId: ""
    });

    const [defaults, setDefaults] = useState({ lowStockThreshold: "", defaultTaxRate: "0" });

    useEffect(() => {
        Promise.all([getProfile(), getPreferences()])
            .then(([{ user }, { preferences }]) => {
                setSavedType(user.businessType || "general");
                setFormData({
                    Shopname: user.Shopname || "",
                    shopAddress: user.shopAddress || "",
                    city: user.city || "",
                    state: user.state || "",
                    gstNumber: user.gstNumber || "",
                    licenseNumber: user.licenseNumber || "",
                    upiId: user.upiId || ""
                });
                const profile = getBusinessType(user.businessType);
                setDefaults({
                    lowStockThreshold: String(preferences?.lowStockThreshold ?? profile.lowStockThreshold),
                    defaultTaxRate: String(preferences?.defaultTaxRate ?? profile.defaultTaxRate)
                });
            })
            .catch((err) => toast.error(err.response?.data?.message || "Could not load business details"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const profile = getBusinessType(savedType);

    const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const saveDetails = async (e) => {
        e.preventDefault();

        if (profile.licence?.required && !formData.licenseNumber.trim()) {
            toast.warning(`${profile.licence.label} is required for a ${profile.shortLabel}`);
            return;
        }

        try {
            setSaving(true);
            await updateProfile({ ...formData, gstNumber: formData.gstNumber.trim().toUpperCase() });
            await refresh();
            toast.success("Business details saved");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSaving(false);
        }
    };

    const confirmTypeChange = async () => {
        const next = getBusinessType(pendingType);

        if (next.licence?.required && !formData.licenseNumber.trim()) {
            toast.warning(`Add your ${next.licence.label} below first, save, then switch to ${next.shortLabel}.`);
            setPendingType(null);
            return;
        }

        try {
            setSavingType(true);
            await updateProfile({ businessType: next.id, licenseNumber: formData.licenseNumber });
            setSavedType(next.id);
            await refresh();
            toast.success(`StoreFlow is now set up for ${next.shortLabel}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not change business type");
        } finally {
            setSavingType(false);
            setPendingType(null);
        }
    };

    const saveDefaults = async (e) => {
        e.preventDefault();
        try {
            setSavingDefaults(true);
            await updatePreferences({
                lowStockThreshold: Number(defaults.lowStockThreshold) || 0,
                defaultTaxRate: Number(defaults.defaultTaxRate) || 0
            });
            await refresh();
            toast.success("Inventory defaults saved");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save defaults");
        } finally {
            setSavingDefaults(false);
        }
    };

    if (loading) return <Spinner />;

    const pending = pendingType ? getBusinessType(pendingType) : null;

    return (
        <div className="space-y-6">
            <SettingsHeading heading={t("bussinessInformation.title")} content={t("bussinessInformation.content")} />

            {/* ---------------- Business type ---------------- */}
            <SettingsSection
                title="Type of business"
                description="Changes labels, which fields you see on each item, units and alerts. Your existing data is kept."
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Business type">
                    {BUSINESS_TYPES.map((type) => {
                        const Icon = type.icon;
                        const active = type.id === savedType;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                disabled={savingType}
                                onClick={() => !active && setPendingType(type.id)}
                                className={[
                                    "relative flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
                                    active
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                        : "border-line hover:border-line-strong hover:bg-surface-hover"
                                ].join(" ")}
                            >
                                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg text-white" style={{ backgroundColor: type.accent }}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="text-xs font-semibold text-heading leading-tight">{type.shortLabel}</span>
                                {active && (
                                    <span className="absolute -top-1.5 -right-1.5 grid place-items-center h-5 w-5 rounded-full bg-primary text-white shadow">
                                        <Check className="h-3 w-3" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-muted border border-line px-4 py-3">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted leading-relaxed">
                        <span className="font-semibold text-heading">{profile.label}:</span>{" "}
                        items are called "{profile.itemLabelPlural.toLowerCase()}",
                        {profile.tracksExpiry ? " expiry dates are tracked," : " no expiry tracking,"}
                        {profile.tracksBatch ? " batch numbers on," : ""} sold by {profile.units.slice(0, 4).join(", ")}
                        {profile.units.length > 4 ? " and more." : "."}
                    </p>
                </div>
            </SettingsSection>

            {/* ---------------- Shop details ---------------- */}
            <form onSubmit={saveDetails}>
                <SettingsSection
                    title="Shop details"
                    description="Printed on every invoice."
                    footer={<Button type="submit" icon={Save} loading={saving}>{t("bussinessInformation.SaveButton")}</Button>}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input className="sm:col-span-2" label={t("bussinessInformation.ShopName")} name="Shopname" icon={Store} value={formData.Shopname} onChange={onChange} required />
                        <Textarea className="sm:col-span-2" label={t("bussinessInformation.ShopAddress")} name="shopAddress" rows={2} value={formData.shopAddress} onChange={onChange} />
                        <Input label={t("bussinessInformation.City")} name="city" icon={Building2} value={formData.city} onChange={onChange} />
                        <Input label={t("bussinessInformation.State")} name="state" icon={MapIcon} value={formData.state} onChange={onChange} />
                        <Input
                            label={t("bussinessInformation.GSTNumber")}
                            name="gstNumber"
                            icon={FileText}
                            maxLength={15}
                            placeholder="Optional"
                            value={formData.gstNumber}
                            onChange={onChange}
                            hint="Invoices say “Tax invoice” when a GSTIN is set"
                        />
                        <Input
                            label={profile.licence?.label || "Trade licence no."}
                            name="licenseNumber"
                            icon={ShieldCheck}
                            placeholder={profile.licence?.placeholder || "Optional"}
                            value={formData.licenseNumber}
                            onChange={onChange}
                            required={Boolean(profile.licence?.required)}
                        />
                        <Input
                            className="sm:col-span-2"
                            label="UPI ID"
                            name="upiId"
                            icon={Smartphone}
                            placeholder="yourshop@okbank"
                            value={formData.upiId}
                            onChange={onChange}
                            hint="Customers scan a QR for this ID on the billing screen"
                        />
                    </div>
                </SettingsSection>
            </form>

            {/* ---------------- Inventory defaults ---------------- */}
            <form onSubmit={saveDefaults}>
                <SettingsSection
                    title="Inventory defaults"
                    description="Applied across the app. Individual items can override the low-stock level."
                    footer={<Button type="submit" icon={Save} loading={savingDefaults}>Save defaults</Button>}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Low stock alert at"
                            type="number"
                            min="0"
                            icon={PackageMinus}
                            suffix="units"
                            value={defaults.lowStockThreshold}
                            onChange={(e) => setDefaults({ ...defaults, lowStockThreshold: e.target.value })}
                            hint={`Recommended for ${profile.shortLabel.toLowerCase()}: ${profile.lowStockThreshold}`}
                        />
                        <Select
                            label="Default GST rate for new items"
                            icon={Percent}
                            options={["0", "5", "12", "18", "28"].map((rate) => ({ value: rate, label: `${rate}%` }))}
                            value={defaults.defaultTaxRate}
                            onChange={(e) => setDefaults({ ...defaults, defaultTaxRate: e.target.value })}
                        />
                    </div>
                </SettingsSection>
            </form>

            <ConfirmDialog
                open={Boolean(pending)}
                tone="primary"
                loading={savingType}
                onCancel={() => setPendingType(null)}
                onConfirm={confirmTypeChange}
                confirmLabel={`Switch to ${pending?.shortLabel}`}
                title={`Switch to ${pending?.label}?`}
                message={
                    pending
                        ? `Items will be called "${pending.itemLabelPlural.toLowerCase()}"${pending.tracksExpiry ? " and expiry dates will be tracked" : ", and expiry fields will be hidden (existing dates are kept)"}. Your products, bills and reports stay exactly as they are.`
                        : ""
                }
            />
        </div>
    );
}
