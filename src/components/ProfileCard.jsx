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


export default function ProfileCard() {

    const sidebarData = [
        { id: 1, icon: DashboardIcon, name: "Dashboard", path: "/" },
        { id: 2, icon: ProductIcon, name: "Product", path: "/Product" },
        { id: 3, icon: InventoryIcon, name: "Category", path: "/Category" },
        { id: 4, icon: PurchaseIcon, name: "Purchase", path: "/purchase" },
        { id: 5, icon: QuicksalesIcon, name: "Quick Sales", path: "/quicksales" },
        { id: 6, icon: SuppliersIcon, name: "Suppliers", path: "/suppliers" },
        { id: 7, icon: CustomerIcon, name: "Customers", path: "/customers" },
        { id: 8, icon: ReportIcon, name: "Reports", path: "/reports" },
        { id: 9, icon: EmployeeIcon, name: "Employees", path: "/employees" },
        { id: 10, icon: NotificationIcon, name: "Notifcations", path: "/notifications" },
        { id: 11, icon: SubscrptionIcon, name: "Subscription", path: "/subscription" },
        { id: 12, icon: SettingIcon, name: "Settings", path: "/settings" },
    ]
    return (
        <div className="bg-white text-black rounded shadow-lg flex flex-col h-screen">
            <div className="flex p-4 item-center gap-4">
                 <MeditaskIcon className="h-10 w-10 stroke-black" />
                <div><h3 className="font-bold text-xl">MediTask</h3><p className="text-xs text-text">India's No. 1 billing App</p></div>
            </div>

            <div className="mt-4">
                {sidebarData.map((item) => {

                    const Icon = item.icon
                    return (
                        <Link to={item.path} key={item.id} >
                            <div className="flex text-text text-sm font-semibold hover:bg-primary hover:text-white hover:shadow-lg p-4 gap-2" >
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
                <LogIn className="w-3 h-3"/>
                Signin</Link>
            </div>
        </div >
    )
}