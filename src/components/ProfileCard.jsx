import { Link } from "react-router-dom";
import { UserPlus, LogIn } from 'lucide-react';

import DashboardIcon from "../components/Icons/DashboardIcons";
import ProductIcon from "../components/Icons/ProductIcon";
import InventoryIcon from "../components/Icons/InventoryIcon";
import PurchaseIcon from "../components/Icons/Purchase";
import QuicksalesIcon from "../components/Icons/QuicksalesIcon";
import SuppliersIcon from "../components/Icons/SuppliersIcon";
import CustomerIcon from "../components/Icons/CustomersIcon";
import ReportIcon from "../components/Icons/ReportsIcon";
import EmployeeIcon from "../components/Icons/EmployeeIcon";
import NotificationIcon from "../components/Icons/Notification";
import SubscrptionIcon from "../components/Icons/SubscriptionIcon";
import SettingIcon from "../components/Icons/SettingsIcon";
import MeditaskIcon from "./Icons/mediTaskIcon";

import { useSubscription } from "../context/SubscriptionContext";


export default function ProfileCard({ closeSidebar }) {

    const sidebarData = [
        { id: 1, icon: DashboardIcon, name: "Dashboard", path: "/" },
        { id: 2, icon: ProductIcon, name: "Product", path: "/Product" },
        { id: 3, icon: InventoryIcon, name: "Category", path: "/Category" },
        { id: 4, icon: SuppliersIcon, name: "Suppliers", path: "/suppliers" },
        { id: 5, icon: ReportIcon, name: "Reports", path: "/reports" },
        { id: 6, icon: NotificationIcon, name: "Billing", path: "/billing" },
        { id: 7, icon: SubscrptionIcon, name: "Subscription", path: "/subscription" },
        { id: 8, icon: SettingIcon, name: "Settings", path: "/settings" },
        // { id: 9, icon: Profile, name: "Most Selling", path: "/mostSell" },
        // { id: 10, icon: Profile, name: "Staff", path: "/staff" },
    ]

    const { subscription, subscriptionLoading } = useSubscription();
    const getRemainingDays = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);

        const difference = end - now;

        return Math.max(
            0,
            Math.ceil(difference / (1000 * 60 * 60 * 24))
        );
    };

    return (
        <div className="bg-white text-black rounded shadow-lg flex flex-col min-h-full overflow-y-auto">

            {!subscriptionLoading && (subscription ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>

                    <div>
                        <p className="text-sm font-semibold text-green-700 capitalize">
                            {subscription.plan} Plan <span className="text-xs text-green-600">Activated</span>
                        </p>

                        <p className="text-xs text-gray-500">
                            {getRemainingDays(subscription.endDate)} days remaining
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 px-3 py-4 rounded-lg bg-red-50 border border-red-200">
                    <h1 className="text-sm">No Subscription Found</h1>
                </div>
            )
            )}

            <div className="flex p-4 item-center gap-4">
                <MeditaskIcon className="h-10 w-10 stroke-black" />
                <div><h3 className="font-bold text-xl">MediTask</h3><p className="text-xs text-text">India's No. 1 billing App</p></div>
            </div>

            <div className="mt-4">
                {sidebarData.map((item) => {

                    const Icon = item.icon
                    return (
                        <Link
                            to={item.path}
                            key={item.id}
                            onClick={closeSidebar}
                        >
                            <div className="flex text-text text-sm font-semibold hover:bg-primary hover:text-white hover:shadow-lg p-4 gap-2">
                                <Icon className="h-5 w-5" />
                                <h3>{item.name}</h3>
                            </div>
                        </Link>
                    )
                })}
            </div>
            <div className=" flex flex-col gap-2 p-2 mt-4 p-4">
                <Link to='/register' className=" flex gap-2 items-center border text-sm rounded p-4 whitespace-nowrap hover:shadow">
                    <UserPlus className="w-3 h-3" />
                    Create Account</Link>
                <Link to='/login' className="flex gap-2 items-center border text-sm rounded p-4 text-center hover:shadow">
                    <LogIn className="w-3 h-3" />
                    Signin</Link>
            </div>
        </div >
    )
}