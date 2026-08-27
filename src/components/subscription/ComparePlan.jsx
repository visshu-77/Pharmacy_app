import { Check, Minus } from "lucide-react";

const features = [
    {
        name: "Product Management",
        normal: true,
        premium: true,
        business: true,
    },
    {
        name: "Category Management",
        normal: true,
        premium: true,
        business: true,
    },
    {
        name: "Inventory Management",
        normal: true,
        premium: true,
        business: true,
    },
    {
        name: "Billing",
        normal: true,
        premium: true,
        business: true,
    },
    {
        name: "Invoice Generation",
        normal: true,
        premium: true,
        business: true,
    },
    {
        name: "Customer Management",
        normal: true,
        premium: true,
        business: true,
    },
    {
        name: "Order Management",
        normal: false,
        premium: true,
        business: true,
    },
    {
        name: "Reports",
        normal: false,
        premium: true,
        business: true,
    },
    {
        name: "Analytics",
        normal: false,
        premium: true,
        business: true,
    },
    {
        name: "Export Reports",
        normal: false,
        premium: true,
        business: true,
    },
    {
        name: "Multi-user Access",
        normal: false,
        premium: false,
        business: true,
    },
    {
        name: "Priority Support",
        normal: false,
        premium: false,
        business: true,
    },
];

function FeatureStatus({ enabled }) {
    return enabled ? (
        <Check
            size={16}
            className="text-blue-600 mx-auto"
        />
    ) : (
        <Minus
            size={16}
            className="text-gray-300 mx-auto"
        />
    );
}

export default function ComparePlans() {

    return (
        <section className="mt-20">

            {/* Heading */}
            <div className="text-center mb-8">

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:bg-darkColor dark:text-white">
                    Compare Plans
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                    A full breakdown of every feature across all plans
                </p>

            </div>


            {/* Table */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl dark:bg-darkColor dark:text-white">

                <table className="w-full min-w-[700px]">

                    <thead>

                        <tr className="border-b bg-gray-50">

                            <th className="text-left p-4 text-xs uppercase text-gray-400 font-semibold dark:bg-darkColor dark:text-white">
                                Feature
                            </th>

                            <th className="p-4 text-center text-sm font-semibold text-gray-600 dark:bg-darkColor dark:text-white">
                                Normal
                            </th>

                            <th className="p-4 text-center text-sm font-semibold text-blue-600 bg-blue-50/50 dark:bg-darkColor dark:text-white">
                                Premium
                            </th>

                            <th className="p-4 text-center text-sm font-semibold text-gray-600 dark:bg-darkColor dark:text-white">
                                Business
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {features.map((feature, index) => (

                            <tr
                                key={index}
                                className="border-b last:border-b-0 hover:bg-gray-50 transition"
                            >

                                <td className="p-4 text-sm text-gray-600 dark:bg-darkColor dark:text-white">
                                    {feature.name}
                                </td>

                                <td className="p-4 text-center dark:bg-darkColor dark:text-white">
                                    <FeatureStatus
                                        enabled={feature.normal}
                                    />
                                </td>

                                <td className="p-4 text-center bg-blue-50/30 dark:bg-darkColor dark:text-white">
                                    <FeatureStatus
                                        enabled={feature.premium}
                                    />
                                </td>

                                <td className="p-4 text-center dark:bg-darkColor dark:text-white">
                                    <FeatureStatus
                                        enabled={feature.business}
                                    />
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </section>
    );
}