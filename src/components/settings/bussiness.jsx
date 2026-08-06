import { useState, useEffect } from "react";
import { updateProfile, getProfile } from "../../services/userService";
import SettingsHeading from "./settingHeading";

export default function BussinessSettings() {

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
        } catch (err) {
            console.log(err);
            alert(
                err.response?.data?.message || "Failed to load profile"
            )
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
    }

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const result = await updateProfile(formData);
            alert("Profile Update Successfully");
        } catch (err) {
            console.log("update Profile error : ", err);
            alert(
                err.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <SettingsHeading 
            heading="Business Information"
            content="Manage your shop and business details."
            />
            <div className="border border-gray-200 rounded-xl p-6 mt-6">
                <div className="grid grid-cols-2 gap-5">
                    <div className="w-full">
                        <label className="block text-sm font-semibold mb-2">Shop Name</label>
                        <input
                            name="Shopname"
                            value={formData.Shopname}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-sm outline-none focus:ring-2 focus-ring-blue-500"
                            placeholder="Shop Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">GST Number</label>
                        <input
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-sm outline-none focus:ring-2 focus-ring-blue-500"
                            placeholder="GST Number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">License Number</label>
                        <input
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-sm outline-none focus:ring-2 focus-ring-blue-500"
                            placeholder="License Number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">City</label>
                        <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-sm outline-none focus:ring-2 focus-ring-blue-500"
                            placeholder="City"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">State</label>
                        <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-sm outline-none focus:ring-2 focus-ring-blue-500"
                            placeholder="State"
                        />
                    </div>
                </div>
                <label className="block text-sm font-semibold mb-2 mt-5">Shop Address</label>
                <textarea
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus-ring-blue-500"
                    placeholder="Shop Address"
                    rows="3"
                />
                <button 
                onClick={handleSaveProfile}
                disabled={loading}
                className="mt-5 bg-blue-600 text-sm text-white px-5 py-3 rounded-lg font-semibold">
                    {loading ? "saving..." : "Save Bussiness Changes"}
                </button>
            </div>
        </div>
    );
}