
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

const counterData = [
    { number: "₹8,420", content: "Today's Revenue" },
    { number: "34", content: "Orders Today" },
    { number: "5", content: "Low Stock" },
    { number: "3", content: "Expiring Soon" },
]

const BoxesData = [
    { icon: CapsuleIcon, number: "1,284", content: "Total Product", status: "12% This Week" },
    { icon: AlertIcon, number: "5", content: "Low Stock Items", status: "Needs attention" },
    { icon: CalenderIcon, number: "3", content: "Expiring Soon", status: "Within 30 days" },
    { icon: MoneyIcon, number: "₹8,420", content: "Today's Sales", status: "↑ 18% vs yesterday" },
    { icon: GraphIcon, number: "₹30,200", content: "Monthly Profit", status: "↑ 8% vs last month" },
    { icon: RailIcon, number: "24", content: "Total Suppliers", status: "3 new this month" },
    { icon: ProfileIcon, number: "8", content: "Employees", status: "All active" },
    { icon: CartIcon, number: "2", content: "Pending Purchases", status: "All active" },
]

const topSellingData = [
    { id: 1, TabletName: "Dolo 650mg", unit: "1,842 units", price: "₹18,420", increase: "12" },
    { id: 2, TabletName: "Crocin Advance", unit: "1,420 units", price: "₹14,200", increase: "8" },
    { id: 3, TabletName: "Pantop 40mg", unit: "980 units", price: "₹29,400", increase: "5" },
    { id: 4, TabletName: "Combiflam", unit: "870 units", price: "₹8,700", increase: "-2" },
    { id: 5, TabletName: "Metformin 500mg", unit: "760 units", price: "₹7,600", increase: "3" }
]

export default function Dashboard() {

    return (
        <div className="">

            {/* Params */}
            <div>
                <LastParams />
            </div>

            {/* Welcome Div */}
            <div className="bg-primary text-white p-4 rounded-2xl mt-4">
                <div className="flex justify-between">
                    <div className="pt-3 pb-3">
                        <h2 className="text-2xl font-semibold capitalize">Welcome Back</h2>
                        <p className="text-sm text-[#BEDBFF]">Here's what's happening at City Medicals today.</p>
                    </div>
                    <div className="flex gap-2">
                        <FilledButton name="Quick sale" link="/dashboard/settings" />
                        <TransparentButton name="Add a Product" link="/dashboard/product" />
                    </div>
                </div>
                <div className="grid grid-cols-4 border-t-1 border-[#ffffff4a] pt-3 pb-3 mt-3">
                    {counterData.map((item, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-semibold">{item.number}</h2>
                            <p className="text-xs text-[#BEDBFF]">{item.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Boxes */}
            <div className="grid grid-cols-4 gap-4 mt-5">
                {BoxesData.map((item, index) => {
                    const Icons = item.icon;
                    return (
                        <div key={index} className="shadow-lg border-1 border-[#d8d8d86b] rounded-2xl p-5 flex cursor-pointer hover:shadow-xl">
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
                <div className='w-[70%] rounded-xl border-1 border-[#9393934a] shadow-xl p-4'>
                    <p>Graph loading.....</p>
                </div>
                <div className='w-[30%] rounded-xl border-1 border-[#9393934a] shadow-xl p-4'>
                    <div className='flex justify-between items-center'>
                        <h3 className='font-bold text-xl'>Top Selling Medicines</h3>
                        <a href="#" className='text-primary font-semibold bg-blue-100 pt-1 pb-1 pr-2 pl-2 rounded-full text-xs'>See All</a>
                    </div>
                    <div className='mt-4 flex flex-col gap-3'>
                        {topSellingData.map((items, index) => {
                            return (
                                <div className='flex justify-between' key={index}>
                                    <div className='flex gap-3 items-center'>
                                        <div>
                                            <p className='text-xs text-text font-semibold bg-gray-200 rounded-full px-2 py-1'>{items.id}</p>
                                        </div>
                                        <div>
                                            <h3 className='text-base font-medium'>{items.TabletName}</h3>
                                            <p className='text-xs text-[#939393]'>{items.unit}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-sm'>{items.price}</h3>
                                        <p className={`font-semibold text-xs text-right ${items.increase < 0 ? "text-red-500" : "text-secondary"}`}>{items.increase > 0 ? "+" : ""}{items.increase}%</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

        </div>
    )
}