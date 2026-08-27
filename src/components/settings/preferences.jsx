import { useEffect, useState } from "react";
import SettingsHeading from "./settingHeading";
import {
    getPreferences,
    updatePreferences
} from "../../services/userService";

import { useTheme } from "../../context/ThemeContext";

import { changeLanguage } from "../../utils/language";

import { useTranslation } from "react-i18next";

export default function Preferences() {

    const { t, i18n } = useTranslation();

    const { theme, toggleTheme } = useTheme();

    const [preferences, setPreferences] = useState({
        language: "English",
        currency: "INR",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",               
        defaultPage: "dashboard",
        theme: "light"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);

            const data = await getPreferences();

            if (data.preferences) {
                setPreferences(data.preferences);
            }

        } catch (err) {
            console.log(err);

            setError(
                err?.response?.data?.message ||
                "Something went wrong"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (e) => {

        const { name, value } = e.target;

        setPreferences((prev) => ({
            ...prev,
            [name]: value
        }));


        // =========================
        // LANGUAGE
        // =========================

        if (name === "language") {

            try {

                await changeLanguage(value);

            } catch (error) {

                console.log(
                    "Language change error:",
                    error
                );

            }

        }


        // =========================
        // THEME
        // =========================

        if (name === "theme") {

            if (
                value === "dark" &&
                theme !== "dark"
            ) {
                toggleTheme();
            }

            if (
                value === "light" &&
                theme !== "light"
            ) {
                toggleTheme();
            }

        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            await updatePreferences(preferences);

            alert("Preferences updated successfully");

        } catch (err) {
            console.log(err);

            setError(
                err?.response?.data?.message ||
                "Something went wrong"
            );

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full">

            <SettingsHeading
                heading={t("PreferencesInformation.title")}
                content={t("PreferencesInformation.content")}
            />


            {/* Loading */}
            {loading ? (

                <div className="py-10 text-center text-sm text-gray-500">
                    Loading preferences...
                </div>

            ) : (

                <div className="mt-5">

                    {/* Preferences Card */}
                    <div className="border border-gray-200 rounded-xl p-4 sm:p-6">

                        {/* Form */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">


                            {/* Language */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("PreferencesInformation.Language")}
                                </label>

                                <select
                                    name="language"
                                    value={preferences.language}
                                    onChange={handleChange}
                                    className="w-full border text-sm rounded-lg px-3 py-3 outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                                >
                                    <option value="English">
                                        {t("PreferencesInformation.English")}
                                    </option>

                                    <option value="Hindi">
                                        {t("PreferencesInformation.Hindi")}
                                    </option>
                                </select>
                            </div>


                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("PreferencesInformation.Currency")}
                                </label>

                                <select
                                    name="currency"
                                    value={preferences.currency}
                                    onChange={handleChange}
                                    className="w-full border text-sm rounded-lg px-3 py-3 outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                                >
                                    <option value="INR">
                                        {t("PreferencesInformation.INR")} (₹)
                                    </option>

                                    <option value="USD">
                                        {t("PreferencesInformation.USD")} ($)
                                    </option>

                                </select>
                            </div>


                            {/* Timezone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("PreferencesInformation.TimeZone")}
                                </label>

                                <select
                                    name="timezone"
                                    value={preferences.timezone}
                                    onChange={handleChange}
                                    className="w-full border text-sm rounded-lg px-3 py-3 outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                                >
                                    <option value="Asia/Kolkata">
                                        {t("PreferencesInformation.India(Asia/Kolkata)")}
                                    </option>

                                    <option value="Asia/Dubai">
                                        {t("PreferencesInformation.Dubai(Asia/Dubai)")}
                                    </option>

                                    <option value="America/New_York">
                                        {t("PreferencesInformation.NewYork(America/New_york)")}
                                    </option>

                                    <option value="Europe/London">
                                        {t("PreferencesInformation.London(Europe/London)")}
                                    </option>
                                </select>
                            </div>


                            {/* Date Format */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("PreferencesInformation.DateFormat")}
                                </label>

                                <select
                                    name="dateFormat"
                                    value={preferences.dateFormat}
                                    onChange={handleChange}
                                    className="w-full border text-sm rounded-lg px-3 py-3 outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                                >
                                    <option value="DD/MM/YYYY">
                                        DD/MM/YYYY
                                    </option>

                                    <option value="MM/DD/YYYY">
                                        MM/DD/YYYY
                                    </option>

                                    <option value="YYYY-MM-DD">
                                        YYYY-MM-DD
                                    </option>
                                </select>
                            </div>


                            {/* Default Page */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("PreferencesInformation.DefaultPage")}
                                </label>

                                <select
                                    name="defaultPage"
                                    value={preferences.defaultPage}
                                    onChange={handleChange}
                                    className="w-full border text-sm rounded-lg px-3 py-3 outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                                >
                                    <option value="dashboard">
                                        {t("PreferencesInformation.Dashboard")}
                                    </option>

                                    <option value="products">
                                        {t("PreferencesInformation.Products")}
                                    </option>

                                    <option value="orders">
                                        {t("PreferencesInformation.orders")}
                                    </option>
                                </select>
                            </div>


                            {/* Theme */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("PreferencesInformation.Theme")}
                                </label>

                                <select
                                    name="theme"
                                    value={preferences.theme}
                                    onChange={handleChange}
                                    className="w-full border text-sm rounded-lg px-3 py-3 outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white"
                                >
                                    <option value="light">
                                        {t("PreferencesInformation.Light")}
                                    </option>

                                    <option value="dark">
                                        {t("PreferencesInformation.Dark")}
                                    </option>
                                </select>
                            </div>

                        </div>


                        {/* Error */}
                        {error && (
                            <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                                <p className="text-xs sm:text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}


                        {/* Save Button */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="mt-5 sm:mt-6 w-full sm:w-auto bg-blue-600 text-white text-sm px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-black dark:text-white dark:border dark:border-white/30"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"
                            }
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}
