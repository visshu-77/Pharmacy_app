import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomerById } from "../services/adminService";

export default function AdminCustomerDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchCustomer = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getCustomerById(id);

                console.log("CUSTOMER DETAILS:", response);

                setCustomer(response.customer);

            } catch (error) {

                console.log("Customer details error:", error);

                setError(
                    error?.response?.data?.message ||
                    "Unable to fetch customer details"
                );

            } finally {

                setLoading(false);

            }
        };

        if (id) {
            fetchCustomer();
        }

    }, [id]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading customer...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">

                    <p className="text-sm text-red-500">
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/admin/customers")}
                        className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                        Back to Customers
                    </button>

                </div>
            </div>
        );
    }


    if (!customer) {
        return null;
    }


    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}

            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">

                <button
                    onClick={() => navigate("/admin/customers")}
                    className="text-sm text-blue-600 hover:underline mr-4"
                >
                    ← Back
                </button>

                <div>

                    <h1 className="text-lg font-semibold text-gray-900">
                        Customer Details
                    </h1>

                    <p className="text-xs text-gray-500">
                        View customer information
                    </p>

                </div>

            </header>


            {/* Content */}

            <div className="p-6">

                <div className="max-w-5xl mx-auto space-y-6">


                    {/* Customer Header */}

                    <div className="bg-white border border-gray-200 rounded-xl p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-semibold text-gray-900">
                                    {customer.Shopname}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {customer.ownerName}
                                </p>

                            </div>


                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${customer.isActive
                                        ? "bg-green-50 text-green-600"
                                        : "bg-red-50 text-red-600"
                                    }`}
                            >
                                {customer.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>

                        </div>

                    </div>


                    {/* Customer Information */}

                    <div className="bg-white border border-gray-200 rounded-xl p-6">

                        <h3 className="text-base font-semibold text-gray-900 mb-5">
                            Customer Information
                        </h3>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <Info
                                label="Shop Name"
                                value={customer.Shopname}
                            />

                            <Info
                                label="Owner Name"
                                value={customer.ownerName}
                            />

                            <Info
                                label="Email"
                                value={customer.email}
                            />

                            <Info
                                label="Mobile Number"
                                value={customer.mobileNumber}
                            />

                            <Info
                                label="Shop Address"
                                value={customer.shopAddress}
                            />

                            <Info
                                label="City"
                                value={customer.city}
                            />

                            <Info
                                label="State"
                                value={customer.state}
                            />

                            <Info
                                label="GST Number"
                                value={customer.gstNumber}
                            />

                            <Info
                                label="License Number"
                                value={customer.licenseNumber}
                            />

                        </div>

                    </div>


                    {/* Subscription */}

                    <div className="bg-white border border-gray-200 rounded-xl p-6">

                        <h3 className="text-base font-semibold text-gray-900 mb-5">
                            Subscription
                        </h3>


                        {customer.currentSubscription ? (

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                <Info
                                    label="Plan"
                                    value={customer.currentSubscription.plan}
                                />

                                <Info
                                    label="Duration"
                                    value={customer.currentSubscription.duration}
                                />

                                <Info
                                    label="Price"
                                    value={`₹${customer.currentSubscription.price}`}
                                />

                                <Info
                                    label="Status"
                                    value={customer.subscriptionStatus}
                                />

                                <Info
                                    label="Start Date"
                                    value={new Date(
                                        customer.currentSubscription.startDate
                                    ).toLocaleDateString("en-IN")}
                                />

                                <Info
                                    label="End Date"
                                    value={new Date(
                                        customer.currentSubscription.endDate
                                    ).toLocaleDateString("en-IN")}
                                />

                            </div>

                        ) : (

                            <p className="text-sm text-gray-500">
                                This customer does not have an active subscription.
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}


function Info({ label, value }) {

    return (
        <div>

            <p className="text-xs text-gray-500">
                {label}
            </p>

            <p className="text-sm font-medium text-gray-900 mt-1">
                {value || "-"}
            </p>

        </div>
    );
}