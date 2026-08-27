import { useState } from "react";
import SettingsHeading from "./settingHeading";
import { changePassword } from "../../services/userService";

import { useTranslation } from "react-i18next";

export default function Security() {

    const { t, i18n } = useTranslation();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleUpdatePassword = async () => {
        try {
            setError("");
            setLoading(true);

            const result = await changePassword(formData);

            alert(result.message);

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

            console.log(err);

        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="w-full">

            <SettingsHeading
                heading={t("SecurityInformation.title")}
                content={t("SecurityInformation.content")}
            />

            {/* Password Form */}
            <div className="border border-gray-200 rounded-xl p-4 sm:p-6 mt-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                    {/* Current Password */}
                    <div>

                        <label className="block text-sm font-semibold mb-2">
                            {t("SecurityInformation.CurrentPassword")}
                        </label>

                        <div className="relative">

                            <input
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="********"
                                className="w-full border text-sm rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(
                                        !showCurrentPassword
                                    )
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword
                                    ? "🙈"
                                    : "👁️"
                                }
                            </button>

                        </div>

                    </div>


                    {/* New Password */}
                    <div>

                        <label className="block text-sm font-semibold mb-2">
                            {t("SecurityInformation.NewPassword")}
                        </label>

                        <div className="relative">

                            <input
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="********"
                                className="w-full border text-sm rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(
                                        !showNewPassword
                                    )
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword
                                    ? "🙈"
                                    : "👁️"
                                }
                            </button>

                        </div>

                    </div>


                    {/* Confirm Password */}
                    <div className="sm:col-span-2">

                        <label className="block text-sm font-semibold mb-2">
                            {t("SecurityInformation.ConfirmNewPassword")}
                        </label>

                        <div className="relative">

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="********"
                                className="w-full border text-sm rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword
                                    ? "🙈"
                                    : "👁️"
                                }
                            </button>

                        </div>

                    </div>

                </div>


                {/* Error */}
                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                        <p className="text-xs sm:text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}


                {/* Button */}
                <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="mt-5 w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-black dark:text-white dark:border dark:border-white/30"
                >
                    {loading
                        ? `${t("SecurityInformation.Saving")}`
                        : `${t("SecurityInformation.SaveButton")}`
                    }
                </button>

            </div>

        </div>
    );
}
