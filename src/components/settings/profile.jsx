import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, Save } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import { Spinner } from "../ui/State";
import { useToast } from "../ui/Toast";

import { updateProfile, getProfile } from "../../services/userService";
import { useBusiness } from "../../context/BusinessContext";

export default function ProfileSettings() {

    const { t } = useTranslation();
    const toast = useToast();
    const { refresh, profile } = useBusiness();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ ownerName: "", email: "", mobileNumber: "" });

    useEffect(() => {
        getProfile()
            .then(({ user }) =>
                setFormData({
                    ownerName: user.ownerName || "",
                    email: user.email || "",
                    mobileNumber: user.mobileNumber ? String(user.mobileNumber) : ""
                })
            )
            .catch((err) => toast.error(err.response?.data?.message || "Could not load profile"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateProfile(formData);
            await refresh();
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update profile");
        } finally {
            setSaving(false);
        }
    };

    const initials = formData.ownerName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "U";

    if (loading) return <Spinner />;

    return (
        <div>
            <SettingsHeading heading={t("profile.title")} content={t("profile.content")} />

            <div className="flex items-center gap-4 mb-6">
                <span
                    className="grid place-items-center h-16 w-16 rounded-2xl text-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: profile.accent }}
                >
                    {initials}
                </span>
                <div className="min-w-0">
                    <p className="font-semibold text-heading truncate">{formData.ownerName || "Owner"}</p>
                    <p className="text-sm text-muted truncate">{formData.email}</p>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <SettingsSection
                    footer={<Button type="submit" icon={Save} loading={saving}>{t("profile.saveButton")}</Button>}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            className="sm:col-span-2"
                            label={t("profile.fullName")}
                            name="ownerName"
                            icon={User}
                            value={formData.ownerName}
                            onChange={onChange}
                            required
                        />
                        <Input
                            label={t("profile.email")}
                            name="email"
                            type="email"
                            icon={Mail}
                            value={formData.email}
                            onChange={onChange}
                            required
                        />
                        <Input
                            label={t("profile.mobileNumber")}
                            name="mobileNumber"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            icon={Phone}
                            value={formData.mobileNumber}
                            onChange={(e) => setFormData((prev) => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, "") }))}
                            required
                        />
                    </div>
                </SettingsSection>
            </form>
        </div>
    );
}
