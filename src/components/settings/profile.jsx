import { useState, useEffect } from "react";
import { updateProfile, getProfile } from "../../services/userService";
import SettingsHeading from "./settingHeading";

export default function ProfileSettings() {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        Shopname: "",
        ownerName: "",
        mobileNumber: "",
        email: "",
        shopAddress: "",
        city: "",
        state: "",
        gstNumber: "",
        licenseNumber: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const result = await getProfile();
            const user = result.user;

            setFormData({
                Shopname: user.Shopname || "",
                ownerName: user.ownerName || "",
                mobileNumber: user.mobileNumber || "",
                email: user.email || "",
                shopAddress: user.shopAddress || "",
                city: user.city || "",
                state: user.state || "",
                gstNumber: user.gstNumber || "",
                licenseNumber: user.licenseNumber || ""
            });

        } catch (error) {
            console.log("Get profile error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load profile"
            );

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

    const handleSaveProfile = async () => {
        try {
            setLoading(true);

            const result = await updateProfile(formData);

            console.log("Profile updated:", result);

            alert("Profile updated successfully!");

        } catch (error) {
            console.log("Update profile error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to update profile"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">

            {/* Heading */}
            <SettingsHeading
                heading="Profile Information"
                content="Manage your personal account information."
            />


            {/* ================= PROFILE HEADER ================= */}
            <div className="flex items-center gap-3 sm:gap-4 mt-5">

                {/* Avatar */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-lg shadow flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">

                    <p>
                        {formData.ownerName
                            ? formData.ownerName
                                .substring(0, 2)
                                .toUpperCase()
                            : "U"
                        }
                    </p>

                </div>


                {/* User Info */}
                <div className="flex flex-col justify-center items-start min-w-0">

                    <p className="font-bold text-sm text-gray-900 truncate max-w-full">
                        {formData.ownerName || "User"}
                    </p>

                    <p className="text-gray-500 text-xs truncate max-w-full">
                        {formData.email || "No email"}
                    </p>

                    <button
                        type="button"
                        className="text-xs text-primary font-semibold mt-1 hover:underline"
                    >
                        Add Image
                    </button>

                </div>

            </div>


            {/* ================= FORM ================= */}
            <div className="border border-gray-200 rounded-xl p-4 sm:p-6 mt-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                    {/* Full Name */}
                    <div>

                        <label className="block text-sm font-semibold mb-2">
                            Full Name
                        </label>

                        <input
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleChange}
                            type="text"
                            placeholder="Owner Name"
                            className="w-full border text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    {/* Email */}
                    <div>

                        <label className="block text-sm font-semibold mb-2">
                            Email
                        </label>

                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="Email"
                            className="w-full text-sm border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    {/* Mobile */}
                    <div>

                        <label className="block text-sm font-semibold mb-2">
                            Mobile Number
                        </label>

                        <input
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            type="text"
                            placeholder="Mobile Number"
                            className="w-full text-sm border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                </div>


                {/* Save Button */}
                <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="mt-5 sm:mt-6 w-full sm:w-auto bg-blue-600 text-sm text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading
                        ? "Saving..."
                        : "Save Changes"
                    }
                </button>

            </div>

        </div>
    );
}
