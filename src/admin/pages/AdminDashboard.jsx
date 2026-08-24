export default function AdminDashboard() {

    return (
        <div className="min-h-screen">

            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage your MediStock platform
                    </p>
                </div>

            </header>


            {/* Content */}
            <div className="p-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    <div className="bg-white rounded-xl border border-gray-200 p-5">

                        <p className="text-sm text-gray-500">
                            Total Customers
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            0
                        </h2>

                    </div>


                    <div className="bg-white rounded-xl border border-gray-200 p-5">

                        <p className="text-sm text-gray-500">
                            Active Subscriptions
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            0
                        </h2>

                    </div>


                    <div className="bg-white rounded-xl border border-gray-200 p-5">

                        <p className="text-sm text-gray-500">
                            Expired Subscriptions
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            0
                        </h2>

                    </div>


                    <div className="bg-white rounded-xl border border-gray-200 p-5">

                        <p className="text-sm text-gray-500">
                            Revenue
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            ₹0
                        </h2>

                    </div>

                </div>

            </div>

        </div>
    );
}

