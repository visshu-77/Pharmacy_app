import { useEffect, useState } from "react"
import SettingsHeading from "./settingHeading"
import { getPreferences, updatePreferences } from "../../services/userService"

export default function Preferences() {
    const [preferences, setPreferences] = useState({
        language: "English",
        currency: "INR",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        defaultPage: "dashboard",
        theme: "light"
    })

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async() => {
        try {
            setLoading(true);

            const data = await getPreferences();

            if (data.preferences) {
                setPreferences(data.preferences)
            }

        } catch (err) {
            console.log(err);
            setError(err?.response?.data?.message || "something went wrong")
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPreferences((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            const response = await updatePreferences(preferences);

            alert("preferences updated successfully");

        } catch (err) {
            console.log(err);
            setError(err?.response?.data?.message || "somethings went wrong")
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <SettingsHeading
                heading="Preferences"
                content="Customize your regional and display preferences."
            />
            {loading ? (
                <div>
                    Loading.....
                </div>
            ) : (
                <div className="p-6">

                    {/* Preferences Card */}
                    <div className="border border-gray-200 rounded-xl p-6">

                        <div className="grid grid-cols-2 gap-5">

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Language
                                </label>

                                <select
                                    name="language"
                                    value={preferences.language}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="English">
                                        English
                                    </option>

                                    <option value="Hindi">
                                        Hindi
                                    </option>
                                </select>
                            </div>


                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Currency
                                </label>

                                <select
                                    name="currency"
                                    value={preferences.currency}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="INR">
                                        INR (₹)
                                    </option>

                                    <option value="USD">
                                        USD ($)
                                    </option>

                                    <option value="EUR">
                                        EUR (€)
                                    </option>
                                </select>
                            </div>


                            {/* Timezone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Time Zone
                                </label>

                                <select
                                    name="timezone"
                                    value={preferences.timezone}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Asia/Kolkata">
                                        India (Asia/Kolkata)
                                    </option>

                                    <option value="Asia/Dubai">
                                        Dubai (Asia/Dubai)
                                    </option>

                                    <option value="America/New_York">
                                        New York (America/New_York)
                                    </option>

                                    <option value="Europe/London">
                                        London (Europe/London)
                                    </option>
                                </select>
                            </div>


                            {/* Date Format */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Date Format
                                </label>

                                <select
                                    name="dateFormat"
                                    value={preferences.dateFormat}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                                    Default Page
                                </label>

                                <select
                                    name="defaultPage"
                                    value={preferences.defaultPage}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="dashboard">
                                        Dashboard
                                    </option>

                                    <option value="products">
                                        Products
                                    </option>

                                    <option value="orders">
                                        Orders
                                    </option>
                                </select>
                            </div>


                            {/* Theme */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Theme
                                </label>

                                <select
                                    name="theme"
                                    value={preferences.theme}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="light">
                                        Light
                                    </option>

                                    <option value="dark">
                                        Dark
                                    </option>

                                    <option value="system">
                                        System Default
                                    </option>
                                </select>
                            </div>

                        </div>


                        {/* Error */}
                        {error && (
                            <p className="mt-4 text-sm text-red-500">
                                {error}
                            </p>
                        )}


                        {/* Save Button */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
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
    )
}