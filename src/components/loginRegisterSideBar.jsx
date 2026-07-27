import MeditaskIcon from "../components/Icons/mediTaskIcon";
import { Box, ChartColumn, Bell, Calendar, } from "lucide-react";

const boxData = [
    {
        id: 1,
        icon: Box,
        heading: "Inventory Management",
        content: "Real-time stock across all categories"
    },
    {
        id: 2,
        icon: ChartColumn,
        heading: "Purchase Tracking",
        content: "Manage suppliers & purchase orders"
    },
    {
        id: 3,
        icon: Bell,
        heading: "Low Stock Alerts",
        content: "Never run out of critical medicines"
    },
    {
        id: 4,
        icon: Calendar,
        heading: "Expiry Notifications",
        content: "Auto-alerts 30, 60 & 90 days before"
    },
]

export default function LoginRegisterSidebar() {
    return (
        <div
            className="relative h-full min-h-full bg-[linear-gradient(145deg,rgb(30,58,138)_0%,rgb(37,99,235)_45%,rgb(59,130,246)_75%,rgb(96,165,250)_100%)] shadow-xl p-12 w-full flex flex-col overflow-hidden
                        before:content-['']
                        before:absolute
                        before:top-[-30px]
                        before:right-[-30px]
                        before:w-50
                        before:h-50
                        before:bg-white/10
                        before:rounded-[100%]
                        ">
            <div className="flex gap-2 items-center mt-3">
                <MeditaskIcon className="h-10 w-10 stroke-white" />
                <h2 className={` font-bold text-white text-2xl`}>MediStock</h2>
            </div>

            <div className="flex flex-col items-left mt-20">
                <h2 className={` font-bold text-white text-3xl`}>The smarter way to <br></br> run your pharmacy.</h2>
                <p className={` text-sm mt-2 leading-[1.6] text-white/70 tracking-wide`}>Join 8,400+ pharmacies already managing inventory, tracking purchases, and staying compliant — all in one place.</p>
            </div>

            <div className="relative flex flex-col gap-2 mt-10
                        before:content['']
                        before:absolute
                        before:bottom-[-70px]
                        before:left-[-50px]
                        before:h-40
                        before:w-40
                        before:bg-white/5
                        before:rounded-[100%]
                        ">
                {boxData.map((data) => {
                    const Icon = data.icon
                    return (
                        <div key={data.id} className="flex gap-2 border border-white/20 rounded-xl px-4 py-4 bg-white/10 items-center">
                            <div>
                                <Icon className="bg-white/50 p-1 h-7 w-7 rounded-lg stroke-white" />
                            </div>
                            <div>
                                <h3 className={` text-xs text-white font-bold`}>{data.heading}</h3>
                                <p className={` text-xs text-white font-thin`}>{data.content}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="relative mt-40 flex gap-4 items-center justify-center
                        before:content['']
                        before:absolute
                        before:right-10
                        before:h-20
                        before:w-20
                        before:bg-white/5
                        before:rounded-[100%]
                        ">
                <div className="flex">
                    <div className="w-7 h-7 rounded-full bg-[#E879F9] border-2 border-[rgba(30,58,138,0.6)] ml-0"></div>
                    <div className="w-7 h-7 rounded-full bg-orange-400 border-2 border-blue-900/60 -ml-2"></div>
                    <div className="w-7 h-7 rounded-full bg-emerald-400 border-2 border-blue-900/60 -ml-2"></div>
                    <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-blue-900/60 -ml-2"></div>
                </div>
                <p className={` text-xs text-white`}>Trusted by <span className="font-bold">8,400+</span> pharmacies</p>
            </div>

        </div>
    )
}