import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react";

import SettingsHeading, { SettingsSection } from "./settingHeading";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import { useToast } from "../ui/Toast";

import { changePassword } from "../../services/userService";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function Security() {

    const { t } = useTranslation();
    const toast = useToast();

    const [formData, setFormData] = useState(EMPTY);
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const strength = (() => {
        const p = formData.newPassword;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword.length < 8) {
            setError("New password must be at least 8 characters");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const result = await changePassword(formData);
            toast.success(result.message || "Password updated");
            setFormData(EMPTY);
        } catch (err) {
            setError(err.response?.data?.message || "Could not update password");
        } finally {
            setLoading(false);
        }
    };

    const type = show ? "text" : "password";

    return (
        <div>
            <SettingsHeading
                heading={t("SecurityInformation.title")}
                content={t("SecurityInformation.content")}
                action={
                    <Button variant="ghost" size="sm" icon={show ? EyeOff : Eye} onClick={() => setShow((v) => !v)}>
                        {show ? "Hide" : "Show"} passwords
                    </Button>
                }
            />

            <form onSubmit={handleSubmit}>
                <SettingsSection
                    title="Change password"
                    description="Use at least 8 characters with a mix of letters and numbers."
                    footer={<Button type="submit" icon={KeyRound} loading={loading}>{t("SecurityInformation.SaveButton")}</Button>}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            className="sm:col-span-2"
                            label={t("SecurityInformation.CurrentPassword")}
                            name="currentPassword"
                            type={type}
                            icon={Lock}
                            autoComplete="current-password"
                            value={formData.currentPassword}
                            onChange={onChange}
                            required
                        />

                        <div>
                            <Input
                                label={t("SecurityInformation.NewPassword")}
                                name="newPassword"
                                type={type}
                                icon={Lock}
                                autoComplete="new-password"
                                value={formData.newPassword}
                                onChange={onChange}
                                required
                            />
                            {formData.newPassword && (
                                <div className="mt-2 flex gap-1" aria-label={`Password strength ${strength} of 4`}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <span
                                            key={i}
                                            className={`h-1 flex-1 rounded-full ${i < strength ? (strength <= 1 ? "bg-danger" : strength <= 2 ? "bg-warning" : "bg-success") : "bg-line"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <Input
                            label={t("SecurityInformation.ConfirmNewPassword")}
                            name="confirmPassword"
                            type={type}
                            icon={Lock}
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            required
                        />

                        {error && (
                            <p className="sm:col-span-2 flex items-center gap-1.5 text-sm text-danger" role="alert">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </p>
                        )}
                    </div>
                </SettingsSection>
            </form>
        </div>
    );
}
