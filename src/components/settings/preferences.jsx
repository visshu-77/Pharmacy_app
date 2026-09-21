import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, IndianRupee, Clock, CalendarDays, LayoutDashboard, Sun, Moon, Save } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import { Select } from "../ui/Field";
import { Spinner } from "../ui/State";
import { useToast } from "../ui/Toast";

import { getPreferences, updatePreferences } from "../../services/userService";
import { useTheme } from "../../context/ThemeContext";
import { useBusiness } from "../../context/BusinessContext";
import { changeLanguage } from "../../utils/language";

export default function Preferences() {

    const { t } = useTranslation();
    const toast = useToast();
    const { theme, toggleTheme } = useTheme();
    const { refresh } = useBusiness();

    const [prefs, setPrefs] = useState({
        language: "English",
        currency: "INR",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        defaultPage: "dashboard"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getPreferences()
            .then((data) => data.preferences && setPrefs((prev) => ({ ...prev, ...data.preferences })))
            .catch((err) => toast.error(err?.response?.data?.message || "Could not load preferences"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = async (e) => {
        const { name, value } = e.target;
        setPrefs((prev) => ({ ...prev, [name]: value }));

        if (name === "language") {
            try {
                await changeLanguage(value);
            } catch (error) {
                console.log("Language change error:", error);
            }
        }
    };

    const setTheme = (value) => {
        if (value !== theme) toggleTheme();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updatePreferences({ ...prefs, theme });
            await refresh();
            toast.success("Preferences saved");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not save preferences");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <SettingsHeading heading={t("PreferencesInformation.title")} content={t("PreferencesInformation.content")} />

            <SettingsSection title={t("PreferencesInformation.Theme")} description="Applies instantly on this device.">
                <div className="grid grid-cols-2 gap-3 max-w-md" role="radiogroup" aria-label="Theme">
                    {[
                        { id: "light", label: t("PreferencesInformation.Light"), icon: Sun, preview: "bg-white border-slate-200" },
                        { id: "dark", label: t("PreferencesInformation.Dark"), icon: Moon, preview: "bg-zinc-900 border-zinc-700" }
                    ].map(({ id, label, icon: Icon, preview }) => (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={theme === id}
                            onClick={() => setTheme(id)}
                            className={`rounded-xl border-2 p-2 text-left transition-all ${theme === id ? "border-primary ring-2 ring-primary/20" : "border-line hover:border-line-strong"}`}
                        >
                            <div className={`h-16 rounded-lg border ${preview} p-2 flex gap-1.5`}>
                                <div className={`w-1/4 rounded ${id === "dark" ? "bg-zinc-800" : "bg-slate-100"}`} />
                                <div className="flex-1 space-y-1.5">
                                    <div className={`h-2 w-3/4 rounded ${id === "dark" ? "bg-zinc-700" : "bg-slate-200"}`} />
                                    <div className="h-2 w-1/2 rounded bg-blue-500" />
                                </div>
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 px-1 text-sm font-semibold text-heading">
                                <Icon className="h-4 w-4" />
                                {label}
                            </p>
                        </button>
                    ))}
                </div>
            </SettingsSection>

            <SettingsSection
                title="Regional"
                footer={<Button type="submit" icon={Save} loading={saving}>{t("settings.saveChanges")}</Button>}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label={t("PreferencesInformation.Language")}
                        name="language"
                        icon={Languages}
                        value={prefs.language}
                        onChange={onChange}
                        options={[
                            { value: "English", label: t("PreferencesInformation.English") },
                            { value: "Hindi", label: t("PreferencesInformation.Hindi") }
                        ]}
                    />
                    <Select
                        label={t("PreferencesInformation.Currency")}
                        name="currency"
                        icon={IndianRupee}
                        value={prefs.currency}
                        onChange={onChange}
                        options={[
                            { value: "INR", label: "Indian Rupee (₹)" },
                            { value: "USD", label: "US Dollar ($)" }
                        ]}
                    />
                    <Select
                        label={t("PreferencesInformation.TimeZone")}
                        name="timezone"
                        icon={Clock}
                        value={prefs.timezone}
                        onChange={onChange}
                        options={[
                            { value: "Asia/Kolkata", label: t("PreferencesInformation.India(Asia/Kolkata)") },
                            { value: "Asia/Dubai", label: t("PreferencesInformation.Dubai(Asia/Dubai)") },
                            { value: "America/New_York", label: t("PreferencesInformation.NewYork(America/New_york)") },
                            { value: "Europe/London", label: t("PreferencesInformation.London(Europe/London)") }
                        ]}
                    />
                    <Select
                        label={t("PreferencesInformation.DateFormat")}
                        name="dateFormat"
                        icon={CalendarDays}
                        value={prefs.dateFormat}
                        onChange={onChange}
                        options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
                    />
                    <Select
                        label={t("PreferencesInformation.DefaultPage")}
                        name="defaultPage"
                        icon={LayoutDashboard}
                        value={prefs.defaultPage}
                        onChange={onChange}
                        options={[
                            { value: "dashboard", label: t("PreferencesInformation.Dashboard") },
                            { value: "products", label: t("PreferencesInformation.Products") },
                            { value: "orders", label: "Billing" }
                        ]}
                    />
                </div>
            </SettingsSection>
        </form>
    );
}
