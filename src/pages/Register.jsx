import MeditaskIcon from "../components/Icons/mediTaskIcon";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { Box, ChartColumn, Bell, Calendar, House, User, Phone, Mail, MapPin, Lock, Building2, BookOpen, Shield, Building, ArrowRight } from "lucide-react";

import LoginRegisterSidebar from "../components/loginRegisterSideBar";


const InputData = [
    {
        id: 1,
        label: "Shop Name",
        icon: House,
        type: "text",
        placeholder: "eg. City Medical",
        width: "w-[49%]",
        required:true
    },
    {
        id: 2,
        label: "Owner Name",
        icon: User,
        type: "text",
        placeholder: "Full Name",
        width: "w-[49%]",
        required:true
    },
    {
        id: 3,
        label: "Mobile Number",
        icon: Phone,
        type: "number",
        placeholder: "10-digit number",
        width: "w-[49%]",
        required:true
    },
    {
        id: 4,
        label: "Email Address",
        icon: Mail,
        type: "email",
        placeholder: "your@example.com",
        width: "w-[49%]",
        required:true
    },
    {
        id: 5,
        label: "Password",
        icon: Lock,
        type: "password",
        placeholder: "Min. 8 Characters",
        width: "w-[49%]",
        required:true
    },
    {
        id: 6,
        label: "Confirm Password",
        icon: Shield,
        type: "password",
        placeholder: "Repeat Password",
        width: "w-[49%]",
        required:true
    },
    {
        id: 7,
        label: "Shop Address",
        icon: MapPin,
        type: "text",
        placeholder: "Street Address, building name",
        width: "w-[98.5%]",
        required:true
    },
    {
        id: 8,
        label: "City",
        icon: Building2,
        type: "text",
        placeholder: "e.g. Mumbai",
        width: "w-[49%]",
        required:true
    },
    {
        id: 9,
        label: "State",
        icon: Building,
        type: "text",
        placeholder: "State",
        width: "w-[49%]",
        required:true
    },
    {
        id: 10,
        label: "GST Number",
        icon: BookOpen,
        type: "text",
        placeholder: "22AAAAA000A1Z5",
        width: "w-[49%]",
        required:true
    },
    {
        id: 11,
        label: "Drug License No.",
        icon: Shield,
        type: "text",
        placeholder: "MH/DRUG/2024/XXXX",
        width: "w-[49%]",
        required:false
    },
]


export default function Register() {
    const navigate = useNavigate();
    return (
        <div className="w-full min-h-full">
            <div className={`w-full min-h-full bg-white text-black flex`}>
                <div className="w-[20%] min-h-full">
                    <LoginRegisterSidebar />
                </div>

                <div className="w-[80%] p-8 overflow-y-auto">
                    <div>
                        <h2 className="font-bold text-2xl">Register your pharmacy</h2>
                        <p className="text-text text-sm mt-2 font-normal">Set up your MediStock account in under 2 minutes.</p>
                    </div>

                    <form
                    onSubmit={(e)=>{
                        e.preventDefault();
                        navigate('/')
                    }}
                    >
                        <div className="flex flex-wrap gap-x-2 gap-y-5 mt-10">
                            {InputData.map((data) => {
                                const Icon = data.icon;
                                return (
                                    <div key={data.id} className={`${data.width}`}>
                                        <label className="font-semibold text-black/70 text-xs">{data.label}</label>
                                        <div className="border border-black/10 rounded-lg flex gap-1 pl-3 items-center">
                                            <Icon className="stroke-text stroke-1 h-4 w-4" />
                                            <input
                                                type={data.type}
                                                placeholder={data.placeholder}
                                                className="text-sm text-text focus:outline-none focus:ring-0 w-full h-full p-3"
                                                required={data.required}
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="flex gap-1 items-center w-full">
                                <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-text">I Agree to MediStock's <Link to='#' className="text-primary hover:underline">Terms Of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link></p>
                            </div>

                            <button type="submit" className="flex gap-2 items-center justify-center w-full p-3 bg-primary text-white font-semibold cursor-pointer rounded hover:bg-[#1b5ce9] hover:shadow"
                            
                            >
                                Create Account
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}