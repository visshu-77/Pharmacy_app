import { getAllCustomers, deleteCustomer } from "../services/adminService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCustomers() {
    const navigate = useNavigate();

    const [customerData, setCustomerData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(10);


    const fetchCustomers = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getAllCustomers({
                page,
                limit,
                search,
                status: "all",
                plan: "all"
            });

            console.log("CUSTOMERS RESPONSE:", response);

            setCustomerData(response);

        } catch (err) {

            console.log("Get customers error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to fetch customers"
            );

        } finally {

            setLoading(false);

        }
    };


    // Fetch customers whenever page/search changes
    useEffect(() => {

        fetchCustomers();

    }, [page, search]);


    // const handleSearch = (e) => {

    //     const value = e.target.value;

    //     setSearch(value);

    //     setPage(1);

    // };

    const handleSearch = (e) => {
        setSearchInput(e.target.value);
    };

    useEffect(() => {

        const timer = setTimeout(() => {

            setSearch(searchInput);
            setPage(1);

        }, 500);

        return () => {
            clearTimeout(timer);
        };

    }, [searchInput]);


    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <p className="text-sm text-gray-500">
                    Loading customers...
                </p>

            </div>
        );

    }


    if (error) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <p className="text-sm text-red-500">
                    {error}
                </p>

            </div>
        );

    }


    const customers = customerData?.customers || [];

    const pagination = customerData?.pagination;

    const handleDeleteCustomer = async () => {

        if (!deletePassword.trim()) {
            setDeleteError("Please enter your admin password");
            return;
        }

        try {

            setDeleteLoading(true);
            setDeleteError("");

            const response = await deleteCustomer(
                selectedCustomerId,
                deletePassword
            );

            console.log("Customer deleted:", response);

            alert("Customer deleted successfully!");

            setShowDeleteModal(false);
            setDeletePassword("");
            setSelectedCustomerId(null);

            // Refresh customer list
            fetchCustomers();

        } catch (error) {

            console.log("Delete customer error:", error);

            setDeleteError(
                error?.response?.data?.message ||
                "Failed to delete customer"
            );

        } finally {

            setDeleteLoading(false);

        }
    };


    return (

        <div className="min-h-screen">

            {/* Header */}

            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">

                <div>

                    <h1 className="text-lg font-semibold text-gray-900">
                        Customers
                    </h1>

                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage all registered customers
                    </p>

                </div>

            </header>


            {/* Content */}

            <div className="p-6">

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">


                    {/* Top Section */}

                    <div className="px-6 py-5 border-b border-gray-100">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>

                                <h2 className="text-base font-semibold text-gray-900">
                                    All Customers
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">

                                    {pagination?.totalCustomers || 0}
                                    {" "}
                                    customers found

                                </p>

                            </div>


                            {/* Search */}

                            <div className="w-full sm:w-[300px]">

                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={handleSearch}
                                    placeholder="Search customers..."
                                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                    </div>


                    {/* Empty State */}

                    {customers.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <p className="text-sm text-gray-500">
                                No customers found.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* Table */}

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b border-gray-100 bg-gray-50">

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Customer
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Email
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Mobile
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Shop
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Status
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Plan
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {customers.map((customer) => (

                                            <tr
                                                key={customer._id}
                                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                                            >

                                                {/* Customer */}

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {customer.ownerName}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {customer._id}
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* Email */}

                                                <td className="px-6 py-4">

                                                    <p className="text-sm text-gray-700">
                                                        {customer.email}
                                                    </p>

                                                </td>


                                                {/* Mobile */}

                                                <td className="px-6 py-4">

                                                    <p className="text-sm text-gray-700">
                                                        {customer.mobileNumber}
                                                    </p>

                                                </td>


                                                {/* Shop */}

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="text-sm font-medium text-gray-800">
                                                            {customer.Shopname}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {customer.city},{" "}
                                                            {customer.state}
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* Status */}

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${customer.isActive
                                                            ? "bg-green-50 text-green-600"
                                                            : "bg-red-50 text-red-600"
                                                            }`}
                                                    >

                                                        {customer.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                {/* Plan */}

                                                <td className="px-6 py-4">

                                                    {customer.currentSubscription ? (

                                                        <div>

                                                            <p className="text-sm font-semibold text-gray-800 capitalize">
                                                                {customer.currentSubscription.plan}
                                                            </p>

                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {customer.subscriptionStatus}
                                                            </p>

                                                        </div>

                                                    ) : (

                                                        <span className="text-sm text-gray-400">
                                                            No Plan
                                                        </span>

                                                    )}

                                                </td>


                                                {/* Actions */}

                                                <td className="px-6 py-4 flex gap-2">

                                                    <button
                                                        onClick={() => navigate(`/admin/customers/${customer._id}`)}
                                                        type="button"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            navigate(`/admin/customers/${customer._id}/edit`)
                                                        }
                                                        className="text-sm text-green-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCustomerId(customer._id);
                                                            setDeletePassword("");
                                                            setDeleteError("");
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-sm text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>


                            {/* Pagination */}

                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">

                                <p className="text-xs text-gray-500">

                                    Page{" "}
                                    <span className="font-semibold text-gray-700">
                                        {pagination?.currentPage || 1}
                                    </span>
                                    {" "}of{" "}
                                    <span className="font-semibold text-gray-700">
                                        {pagination?.totalPages || 1}
                                    </span>

                                </p>


                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        disabled={page === 1}
                                        onClick={() =>
                                            setPage((prev) => prev - 1)
                                        }
                                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>


                                    <button
                                        type="button"
                                        disabled={
                                            page >=
                                            (pagination?.totalPages || 1)
                                        }
                                        onClick={() =>
                                            setPage((prev) => prev + 1)
                                        }
                                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>

                                </div>

                            </div>

                        </>

                    )}

                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">

                                <h2 className="text-lg font-semibold text-gray-900">
                                    Delete Customer?
                                </h2>

                                <p className="text-sm text-gray-500 mt-2">
                                    This action will permanently delete the customer
                                    and their subscription history.
                                </p>


                                {/* Password */}

                                <div className="mt-5">

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Admin Password
                                    </label>

                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => {
                                            setDeletePassword(e.target.value);
                                            setDeleteError("");
                                        }}
                                        placeholder="Enter your password"
                                        disabled={deleteLoading}
                                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />

                                </div>


                                {/* Error */}

                                {deleteError && (
                                    <p className="text-sm text-red-500 mt-2">
                                        {deleteError}
                                    </p>
                                )}


                                {/* Buttons */}

                                <div className="flex justify-end gap-3 mt-6">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeletePassword("");
                                            setDeleteError("");
                                            setSelectedCustomerId(null);
                                        }}
                                        disabled={deleteLoading}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleDeleteCustomer}
                                        disabled={deleteLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        {deleteLoading
                                            ? "Deleting..."
                                            : "Yes, Delete"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </div>

    );
}