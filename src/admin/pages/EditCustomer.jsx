import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCustomerById,
    updateCustomer
} from "../services/adminService";


export default function EditCustomer() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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


    // =========================
    // FETCH CUSTOMER
    // =========================

    useEffect(() => {

        const fetchCustomer = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getCustomerById(id);

                console.log("CUSTOMER DATA:", response);

                const customer =
                    response.customer || response.user;

                if (!customer) {

                    setError("Customer not found");
                    return;

                }


                setFormData({

                    Shopname:
                        customer.Shopname || "",

                    ownerName:
                        customer.ownerName || "",

                    mobileNumber:
                        customer.mobileNumber || "",

                    email:
                        customer.email || "",

                    shopAddress:
                        customer.shopAddress || "",

                    city:
                        customer.city || "",

                    state:
                        customer.state || "",

                    gstNumber:
                        customer.gstNumber || "",

                    licenseNumber:
                        customer.licenseNumber || ""

                });


            } catch (err) {

                console.log(
                    "Fetch customer error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to fetch customer"
                );

            } finally {

                setLoading(false);

            }

        };


        fetchCustomer();

    }, [id]);


    // =========================
    // INPUT CHANGE
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));


        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }

    };


    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const confirmed = window.confirm(
            "Are you sure you want to update this customer?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const response = await updateCustomer( id, formData);
            console.log("UPDATE CUSTOMER RESPONSE:",response);

            
            setSuccess(response?.message ||"Customer updated successfully");

            setTimeout(() => {
                navigate("/admin/customers");
            }, 1000);


        } catch (err) {

            console.log(
                "Update customer error:",
                err
            );


            setError(
                err?.response?.data?.message ||
                "Unable to update customer"
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <p className="text-sm text-gray-500">
                    Loading customer...
                </p>

            </div>

        );

    }


    // =========================
    // PAGE
    // =========================

    return (

        <div className="min-h-screen bg-[#F7F9FC]">

            {/* ================= HEADER ================= */}

            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

                <div>

                    <h1 className="text-lg font-semibold text-gray-900">
                        Edit Customer
                    </h1>

                    <p className="text-xs text-gray-500 mt-0.5">
                        Update customer information
                    </p>

                </div>


                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/customers")
                    }
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                    Back
                </button>

            </header>


            {/* ================= CONTENT ================= */}

            <div className="p-6">

                <div className="max-w-4xl mx-auto">

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

                        {/* CARD HEADER */}

                        <div className="px-6 py-5 border-b border-gray-200">

                            <h2 className="text-base font-semibold text-gray-900">
                                Customer Information
                            </h2>

                            <p className="text-xs text-gray-500 mt-1">
                                Update the customer's account details below.
                            </p>

                        </div>


                        {/* ================= FORM ================= */}

                        <form
                            onSubmit={handleSubmit}
                            className="p-6"
                        >

                            {/* ERROR */}

                            {error && (

                                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200">

                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>

                                </div>

                            )}


                            {/* SUCCESS */}

                            {success && (

                                <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200">

                                    <p className="text-sm text-green-600">
                                        {success}
                                    </p>

                                </div>

                            )}


                            {/* ================= GRID ================= */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                                {/* SHOP NAME */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop Name
                                    </label>

                                    <input
                                        type="text"
                                        name="Shopname"
                                        value={formData.Shopname}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* OWNER NAME */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Owner Name
                                    </label>

                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* MOBILE */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mobile Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* EMAIL */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* SHOP ADDRESS */}

                                <div className="md:col-span-2">

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop Address
                                    </label>

                                    <textarea
                                        name="shopAddress"
                                        value={formData.shopAddress}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* CITY */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* STATE */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* GST */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        GST Number
                                    </label>

                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>


                                {/* LICENSE */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        License Number
                                    </label>

                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>

                            </div>


                            {/* ================= BUTTONS ================= */}

                            <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-gray-200">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/admin/customers")
                                    }
                                    disabled={saving}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >

                                    {saving
                                        ? "Updating..."
                                        : "Update Customer"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

        </div>

    );

}