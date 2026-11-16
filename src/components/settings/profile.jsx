import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, Save, Upload, Trash2 } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import { Spinner } from "../ui/State";
import { useToast } from "../ui/Toast";

import {
    updateProfile,
    getProfile,
    uploadProfileImage,
    removeProfileImage
} from "../../services/userService";
import { useBusiness } from "../../context/BusinessContext";

export default function ProfileSettings() {

    const { t } = useTranslation();
    const toast = useToast();
    const { refresh, profile } = useBusiness();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingLogo, setSavingLogo] = useState(false);
    const [removingLogo, setRemovingLogo] = useState(false);
    const [profileImage, setProfileImage] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [formData, setFormData] = useState({ ownerName: "", email: "", mobileNumber: "" });

    useEffect(() => {
        getProfile()
            .then(({ user }) => {
                setFormData({
                    ownerName: user.ownerName || "",
                    email: user.email || "",
                    mobileNumber: user.mobileNumber ? String(user.mobileNumber) : ""
                });
                setProfileImage(user.profileImage || "");
            })
            .catch((err) => toast.error(err.response?.data?.message || "Could not load profile"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!logoPreview) return undefined;
        return () => URL.revokeObjectURL(logoPreview);
    }, [logoPreview]);

    const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const onLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.warning("Choose a PNG, JPEG or WebP image");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.warning("Image must be 2 MB or smaller");
            e.target.value = "";
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const saveLogo = async () => {
        if (!logoFile) return;

        try {
            setSavingLogo(true);
            const result = await uploadProfileImage(logoFile);
            setProfileImage(result.user.profileImage || "");
            setLogoFile(null);
            setLogoPreview("");
            await refresh();
            toast.success("Shop logo saved");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save shop logo");
        } finally {
            setSavingLogo(false);
        }
    };

    const clearLogo = async () => {
        try {
            setRemovingLogo(true);
            await removeProfileImage();
            setProfileImage("");
            setLogoFile(null);
            setLogoPreview("");
            await refresh();
            toast.success("Shop logo removed");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not remove shop logo");
        } finally {
            setRemovingLogo(false);
        }
    };

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

            <SettingsSection
                title="Shop logo"
                description="Shown on printed invoices. PNG, JPEG or WebP, up to 2 MB."
                footer={
                    <div className="flex flex-wrap gap-2">
                        {logoFile && (
                            <Button type="button" icon={Upload} loading={savingLogo} onClick={saveLogo}>
                                Upload logo
                            </Button>
                        )}
                        {profileImage && !logoFile && (
                            <Button type="button" variant="ghost" icon={Trash2} loading={removingLogo} onClick={clearLogo}>
                                Remove logo
                            </Button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-wrap items-center gap-4">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-line bg-surface-muted">
                        {(logoPreview || profileImage)
                            ? <img src={logoPreview || profileImage} alt="Shop logo preview" className="h-full w-full object-contain p-1" />
                            : <span className="text-2xl font-bold text-muted">{initials}</span>}
                    </div>
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-line px-3 py-2 text-sm font-semibold text-heading hover:bg-surface-hover">
                        Choose image
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={onLogoChange}
                            className="sr-only"
                            aria-label="Choose shop logo"
                        />
                    </label>
                    {logoFile && <span className="text-xs text-muted">{logoFile.name}</span>}
                </div>
            </SettingsSection>

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
