
import { useState, useEffect } from "react";
import { getDashboardSummary } from "../services/dashboardService"

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

// const counterData = [
//     { number: "₹8,420", content: "Today's Revenue" },
//     { number: "34", content: "Orders Today" },
//     { number: "5", content: "Low Stock" },
//     { number: "3", content: "Expiring Soon" },
// ]

// const BoxesData = [
//     { icon: CapsuleIcon, number: "1,284", content: "Total Product", status: "12% This Week" },
//     { icon: AlertIcon, number: "5", content: "Low Stock Items", status: "Needs attention" },
//     { icon: CalenderIcon, number: "3", content: "Expiring Soon", status: "Within 30 days" },
//     { icon: MoneyIcon, number: "₹8,420", content: "Today's Sales", status: "↑ 18% vs yesterday" },
//     { icon: GraphIcon, number: "₹30,200", content: "Monthly Profit", status: "↑ 8% vs last month" },
//     { icon: RailIcon, number: "24", content: "Total Suppliers", status: "3 new this month" },
//     { icon: ProfileIcon, number: "8", content: "Employees", status: "All active" },
//     { icon: CartIcon, number: "2", content: "Pending Purchases", status: "All active" },
// ]

// const topSellingData = [
//     { id: 1, TabletName: "Dolo 650mg", unit: "1,842 units", price: "₹18,420", increase: "12" },
//     { id: 2, TabletName: "Crocin Advance", unit: "1,420 units", price: "₹14,200", increase: "8" },
//     { id: 3, TabletName: "Pantop 40mg", unit: "980 units", price: "₹29,400", increase: "5" },
//     { id: 4, TabletName: "Combiflam", unit: "870 units", price: "₹8,700", increase: "-2" },
//     { id: 5, TabletName: "Metformin 500mg", unit: "760 units", price: "₹7,600", increase: "3" }
// ]

export default function Dashboard() {

    const [currentUser, setCurrentUser ] = useState(null);
    const [loading, setLoading] = useState(false);

    const [dashboardSummary, setDashboardSummary] = useState({
        "todaysRevenue": 0,
        "ordersToday": 0,
        "lowStock": 0,
        "expiringSoon": 0
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
                setDashboardBoxes(data.summary || {})

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
            try{
                setLoading(true);
                const data = await getProfile();
                console.log("Profile data ======>",data)
                setCurrentUser(data.user)
            }catch(err){
                console.log(err);
            }finally{
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, [])

    const counterData = [
        {
            number: `₹${Number(
                dashboardSummary.todaysRevenue || 0
            ).toLocaleString("en-IN")}`,
            content: "Today's Revenue"
        },
        {
            number: dashboardSummary.ordersToday,
            content: "Orders Today"
        },
        {
            number: dashboardSummary.lowStock,
            content: "Low Stock"
        },
        {
            number: dashboardSummary.expiringSoon,
            content: "Expiring Soon"
        }
    ]

    const BoxesData = [
        {
            icon: CapsuleIcon,
            number: dashboardBoxes.totalProducts,
            content: "Total Product",
            status: "Total products"
        },
        {
            icon: AlertIcon,
            number: dashboardBoxes.lowStock,
            content: "Low Stock Items",
            status: "Needs attention"
        },
        {
            icon: CalenderIcon,
            number: dashboardBoxes.expiringSoon,
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
            number: dashboardBoxes.totalSuppliers,
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
            number: dashboardSummary.totalCategories,
            content: "Total Categories",
            status: "All categories"
        }
    ];

    return (
        <div className="w-full">

            {/* Params */}
            <div>
                <LastParams />
            </div>

            {/* Welcome Div */}
            <div className="bg-primary text-white p-4 rounded-2xl mt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="pt-3 pb-3">
                        <h2 className="text-2xl font-semibold capitalize">
                            {loading
                            ? "welcome..."
                            : `Welcome ${currentUser?.ownerName?.split(" ")[0] || ""}`
                        } 👋                                                
                        </h2>
                        <p className="text-sm text-[#BEDBFF]">Here's what's happening at City Medicals today.</p>
                    </div>
                    <div className="flex flex-row gap-2 w-full sm:w-auto">
                        <FilledButton name="Quick sale" link="/settings" />
                        <TransparentButton name="Add a Product" link="/Product" />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 border-t-1 border-[#ffffff4a] pt-3 pb-3 mt-3">
                    {counterData.map((item, index) => (
                        <div key={index}>
                            <h2 className="text-lg sm:text-xl font-semibold">
                                {dashboardLoading
                                    ? "..."
                                    : item.number
                                }
                            </h2>
                            <p className="text-xs text-[#BEDBFF]">{item.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5">
                {BoxesData.map((item, index) => {
                    const Icons = item.icon;
                    return (
                        <div key={index} className="shadow-lg border-1 border-[#d8d8d86b] rounded-2xl p-4 sm:p-5 flex cursor-pointer hover:shadow-xl">
                            <div className="w-[50%]">
                                <Icons className="h-12 w-12" />
                                <h2 className="text-2xl font-bold mt-5">{item.number}</h2>
                                <p className="text-sm text-[#939393] ">{item.content}</p>
                            </div>
                            <div className="w-[50%] item-center flex justify-end">
                                <p className="text-xs text-secondary font-medium">{item.status}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Graph and top selling */}
            <div className='flex mt-5 gap-4'>
                <div className='w-[100%] rounded-xl border-1 border-[#9393934a] shadow-xl p-4'>
                    <div className='flex justify-between items-center'>
                        <h3 className='font-bold text-xl'>
                            Top Selling Medicines
                        </h3>
                        <a
                            href="/reports"
                            className='text-primary font-semibold bg-blue-100 pt-1 pb-1 pr-2 pl-2 rounded-full text-xs'
                        >
                            See All
                        </a>
                    </div>
                    <div className='mt-4 flex flex-col gap-3'>
                        {topProductsLoading ? (
                            <div className="py-5 text-center text-sm text-gray-500">
                                Loading...
                            </div>
                        ) : topProducts.length === 0 ? (
                            <div className="py-5 text-center text-sm text-gray-500">
                                No product sales available.
                            </div>
                        ) : (
                            topProducts.slice(0, 5).map((product, index) => (
                                <div
                                    className='flex justify-between'
                                    key={product._id}
                                >
                                    <div className='flex gap-3 items-center'>
                                        <div>
                                            <p className='text-xs text-text font-semibold bg-gray-200 rounded-full px-2 py-1'>
                                                {index + 1}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className='text-base font-medium'>
                                                {product.productName}
                                            </h3>
                                            <p className='text-xs text-[#939393]'>
                                                {Number(
                                                    product.quantitySold || 0
                                                ).toLocaleString("en-IN")} units
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-sm'>
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
    )
}