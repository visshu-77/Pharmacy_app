import { useState, useEffect } from "react";
import { getDashboardSummary } from "../services/dashboardService";

import LastParams from "../components/lastParams";

import FilledButton from "../components/filledButton";
import TransparentButton from "../components/transparentButton";

import CapsuleIcon from "../components/Icons/CapsuleIcon";
import AlertIcon from "../components/Icons/AlertIcon";
import CalenderIcon from "../components/Icons/CalenderIcon";
import MoneyIcon from "../components/Icons/moneyIcon";
import GraphIcon from "../components/Icons/GraphIcon";
import RailIcon from "../components/Icons/RailIcon";
import ProfileIcon from "../components/Icons/ProfileIcon";
import CartIcon from "../components/Icons/CartIcon";

import { getTopSellingProducts } from "../services/reportService";
import { getProfile } from "../services/userService";

export default function Dashboard() {

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [dashboardSummary, setDashboardSummary] = useState({
        todaysRevenue: 0,
        ordersToday: 0,
        lowStock: 0,
        expiringSoon: 0
    });

    const [dashboardBoxes, setDashboardBoxes] = useState({
        totalProducts: 0,
        lowStockItems: 0,
        expiringSoon: 0,
        todaysSales: 0,
        monthlyProfit: 0,
        totalSuppliers: 0,
        employees: 0,
        pendingPurchases: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        totalCategories: 0
    });

    const [dashboardLoading, setDashboardLoading] = useState(true);

    const [topProducts, setTopProducts] = useState([]);
    const [topProductsLoading, setTopProductsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                setDashboardLoading(true);

                const data = await getDashboardSummary();

                console.log(data);

                setDashboardSummary(data.summary || {});
                setDashboardBoxes(data.summary || {});

            } catch (err) {
                console.log(err);
            } finally {
                setDashboardLoading(false);
            }
        };

        fetchDashboardSummary();
    }, []);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                setTopProductsLoading(true);

                const data = await getTopSellingProducts("quantity");

                console.log("Home Top Products:", data);

                setTopProducts(data.products || []);

            } catch (error) {
                console.log("Home top products error:", error);
            } finally {
                setTopProductsLoading(false);
            }
        };

        fetchTopProducts();
    }, []);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                setLoading(true);

                const data = await getProfile();

                console.log("Profile data ======>", data);

                setCurrentUser(data.user);

            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const counterData = [
        {
            number: `₹${Number(
                dashboardSummary.todaysRevenue || 0
            ).toLocaleString("en-IN")}`,
            content: "Today's Revenue"
        },
        {
            number: dashboardSummary.ordersToday || 0,
            content: "Orders Today"
        },
        {
            number: dashboardSummary.lowStock || 0,
            content: "Low Stock"
        },
        {
            number: dashboardSummary.expiringSoon || 0,
            content: "Expiring Soon"
        }
    ];

    const BoxesData = [
        {
            icon: CapsuleIcon,
            number: dashboardBoxes.totalProducts || 0,
            content: "Total Product",
            status: "Total products"
        },
        {
            icon: AlertIcon,
            number: dashboardBoxes.lowStock || 0,
            content: "Low Stock Items",
            status: "Needs attention"
        },
        {
            icon: CalenderIcon,
            number: dashboardBoxes.expiringSoon || 0,
            content: "Expiring Soon",
            status: "Within 30 days"
        },
        {
            icon: MoneyIcon,
            number: `₹${Number(
                dashboardBoxes.todaysRevenue || 0
            ).toLocaleString("en-IN")}`,
            content: "Today's Sales",
            status: "Today's revenue"
        },
        {
            icon: GraphIcon,
            number: `₹${Number(
                dashboardSummary.monthlyRevenue || 0
            ).toLocaleString("en-IN")}`,
            content: "Monthly Profit",
            status: "This month"
        },
        {
            icon: RailIcon,
            number: dashboardBoxes.totalSuppliers || 0,
            content: "Total Suppliers",
            status: "Active suppliers"
        },
        {
            icon: ProfileIcon,
            number: `₹${Number(
                dashboardSummary.yearlyRevenue || 0
            ).toLocaleString("en-IN")}`,
            content: "This Year Revenue",
            status: "Current year"
        },
        {
            icon: CartIcon,
            number: dashboardSummary.totalCategories || 0,
            content: "Total Categories",
            status: "All categories"
        }
    ];

    return (
        <div className="w-full min-w-0">

            {/* Params */}
            <div className="w-full">
                <LastParams />
            </div>

            {/* Welcome */}
            <div className="bg-primary text-white p-4 sm:p-5 rounded-2xl mt-4">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Welcome text */}
                    <div className="min-w-0">

                        <h2 className="text-xl sm:text-2xl font-semibold capitalize break-words">
                            {loading
                                ? "Welcome..."
                                : `Welcome ${
                                    currentUser?.ownerName?.split(" ")[0] || ""
                                }`
                            } 👋
                        </h2>

                        <p className="text-xs sm:text-sm text-[#BEDBFF] mt-1">
                            Here's what's happening at City Medicals today.
                        </p>

                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col xs:flex-row sm:flex-row gap-2 w-full lg:w-auto">

                        <div className="w-full sm:w-auto">
                            <FilledButton
                                name="Quick Sale"
                                link="/settings"
                            />
                        </div>

                        <div className="w-full sm:w-auto">
                            <TransparentButton
                                name="Add a Product"
                                link="/Product"
                            />
                        </div>

                    </div>

                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-3 border-t border-[#ffffff4a] pt-4 mt-5">

                    {counterData.map((item, index) => (

                        <div
                            key={index}
                            className={`
                                min-w-0
                                ${
                                    index !== 0
                                        ? "sm:border-l sm:border-[#ffffff25] sm:pl-4"
                                        : ""
                                }
                            `}
                        >

                            <h2 className="text-base sm:text-xl font-semibold truncate">
                                {dashboardLoading
                                    ? "..."
                                    : item.number
                                }
                            </h2>

                            <p className="text-[10px] sm:text-xs text-[#BEDBFF] mt-1">
                                {item.content}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* Dashboard Boxes */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">

                {BoxesData.map((item, index) => {

                    const Icons = item.icon;

                    return (

                        <div
                            key={index}
                            className="
                                border
                                border-[#d8d8d86b]
                                rounded-2xl
                                p-4
                                sm:p-5
                                flex
                                justify-between
                                gap-3
                                min-w-0
                                bg-white
                                cursor-pointer
                                transition
                                hover:shadow-lg
                            "
                        >

                            {/* Left */}
                            <div className="min-w-0 flex-1">

                                <Icons className="h-9 w-9 sm:h-11 sm:w-11" />

                                <h2 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-5 truncate">
                                    {item.number}
                                </h2>

                                <p className="text-xs sm:text-sm text-[#939393] truncate mt-1">
                                    {item.content}
                                </p>

                            </div>

                            {/* Right */}
                            <div className="flex-shrink-0 flex items-start justify-end">

                                <p className="text-[10px] sm:text-xs text-secondary font-medium text-right">
                                    {item.status}
                                </p>

                            </div>

                        </div>

                    );
                })}

            </div>

            {/* Top Selling */}
            <div className="mt-4 sm:mt-5">

                <div className="w-full rounded-xl border border-[#9393934a] shadow-sm sm:shadow-lg p-4 sm:p-5">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">

                        <h3 className="font-bold text-base sm:text-xl">
                            Top Selling Medicines
                        </h3>

                        <a
                            href="/reports"
                            className="
                                flex-shrink-0
                                text-primary
                                font-semibold
                                bg-blue-100
                                px-2.5
                                py-1
                                rounded-full
                                text-[10px]
                                sm:text-xs
                            "
                        >
                            See All
                        </a>

                    </div>

                    {/* Products */}
                    <div className="mt-4 flex flex-col">

                        {topProductsLoading ? (

                            <div className="py-8 text-center text-sm text-gray-500">
                                Loading...
                            </div>

                        ) : topProducts.length === 0 ? (

                            <div className="py-8 text-center text-sm text-gray-500">
                                No product sales available.
                            </div>

                        ) : (

                            topProducts.slice(0, 5).map((product, index) => (

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        py-3
                                        border-b
                                        last:border-b-0
                                    "
                                    key={product._id}
                                >

                                    {/* Product info */}
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">

                                        <div className="flex-shrink-0">

                                            <p className="
                                                text-[10px]
                                                sm:text-xs
                                                text-text
                                                font-semibold
                                                bg-gray-200
                                                rounded-full
                                                w-6
                                                h-6
                                                flex
                                                items-center
                                                justify-center
                                            ">
                                                {index + 1}
                                            </p>

                                        </div>

                                        <div className="min-w-0">

                                            <h3 className="text-sm sm:text-base font-medium truncate">
                                                {product.productName}
                                            </h3>

                                            <p className="text-[10px] sm:text-xs text-[#939393]">
                                                {Number(
                                                    product.quantitySold || 0
                                                ).toLocaleString("en-IN")}{" "}
                                                units
                                            </p>

                                        </div>

                                    </div>

                                    {/* Sales */}
                                    <div className="flex-shrink-0 text-right">

                                        <h3 className="font-semibold text-xs sm:text-sm">
                                            ₹{Number(
                                                product.totalSales || 0
                                            ).toLocaleString("en-IN")}
                                        </h3>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}
