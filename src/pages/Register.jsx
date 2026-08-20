import MeditaskIcon from "../components/Icons/mediTaskIcon";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
    House,
    User,
    Phone,
    Mail,
    MapPin,
    Lock,
    Building2,
    BookOpen,
    Shield,
    Building,
    ArrowRight,
    ArrowLeft
} from "lucide-react";

import LoginRegisterSidebar from "../components/loginRegisterSideBar";

import { registerUser } from "../services/authService";


const InputData = [
    {
        id: 1,
        name: "Shopname",
        label: "Shop Name",
        icon: House,
        type: "text",
        placeholder: "eg. City Medical",
        required: true
    },
    {
        id: 2,
        name: "ownerName",
        label: "Owner Name",
        icon: User,
        type: "text",
        placeholder: "Full Name",
        required: true
    },
    {
        id: 3,
        name: "mobileNumber",
        label: "Mobile Number",
        icon: Phone,
        type: "tel",
        placeholder: "10-digit number",
        required: true
    },
    {
        id: 4,
        name: "email",
        label: "Email Address",
        icon: Mail,
        type: "email",
        placeholder: "your@example.com",
        required: true
    },
    {
        id: 5,
        name: "Password",
        label: "Password",
        icon: Lock,
        type: "password",
        placeholder: "Min. 8 Characters",
        required: true
    },
    {
        id: 6,
        name: "confirmPassword",
        label: "Confirm Password",
        icon: Shield,
        type: "password",
        placeholder: "Repeat Password",
        required: true
    },
    {
        id: 7,
        name: "shopAddress",
        label: "Shop Address",
        icon: MapPin,
        type: "text",
        placeholder: "Street Address, building name",
        fullWidth: true,
        required: true
    },
    {
        id: 8,
        name: "city",
        label: "City",
        icon: Building2,
        type: "text",
        placeholder: "e.g. Mumbai",
        required: true
    },
    {
        id: 9,
        name: "state",
        label: "State",
        icon: Building,
        type: "text",
        placeholder: "State",
        required: true
    },
    {
        id: 10,
        name: "gstNumber",
        label: "GST Number",
        icon: BookOpen,
        type: "text",
        placeholder: "22AAAAA000A1Z5",
        required: true
    },
    {
        id: 11,
        name: "licenseNumber",
        label: "Drug License No.",
        icon: Shield,
        type: "text",
        placeholder: "MH/DRUG/2024/XXXX",
        required: false
    }
];


export default function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Shopname: "",
        ownerName: "",
        mobileNumber: "",
        email: "",
        Password: "",
        confirmPassword: "",
        shopAddress: "",
        city: "",
        state: "",
        gstNumber: "",
        licenseNumber: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await registerUser(formData);

            console.log(result);

            alert("Registration successful");

            localStorage.setItem("token", result.token);

            navigate("/login", {
                replace: true
            });

        } catch (err) {
            console.log(
                err.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="w-full min-h-screen bg-white text-black">

            <div className="w-full min-h-screen flex">

                {/* ================= SIDEBAR ================= */}

                <div className="hidden lg:block lg:w-[20%] lg:flex-shrink-0">
                    <LoginRegisterSidebar />
                </div>


                {/* ================= REGISTER CONTENT ================= */}

                <div className="w-full lg:w-[80%] p-4 sm:p-6 lg:p-8 overflow-y-auto">

                    <div className="max-w-5xl mx-auto">
                        {/* Back Button */}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-5"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        {/* Header */}
                        <div>

                            <h2 className="font-bold text-xl sm:text-2xl">
                                Register your pharmacy
                            </h2>

                            <p className="text-text text-xs sm:text-sm mt-2 font-normal">
                                Set up your MediStock account in under 2 minutes.
                            </p>

                        </div>


                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 sm:mt-8 lg:mt-10"
                        >

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                                {InputData.map((data) => {

                                    const Icon = data.icon;

                                    return (
                                        <div
                                            key={data.id}
                                            className={
                                                data.fullWidth
                                                    ? "sm:col-span-2"
                                                    : ""
                                            }
                                        >

                                            {/* Label */}
                                            <label className="block font-semibold text-black/70 text-xs mb-2">
                                                {data.label}
                                            </label>


                                            {/* Input */}
                                            <div className="border border-black/10 rounded-lg flex gap-2 pl-3 items-center bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">

                                                <Icon
                                                    className="stroke-text stroke-1 h-4 w-4 flex-shrink-0"
                                                />

                                                <input
                                                    type={data.type}
                                                    name={data.name}
                                                    placeholder={data.placeholder}
                                                    value={
                                                        formData[data.name]
                                                    }
                                                    onChange={handleChange}
                                                    className="text-sm text-text focus:outline-none focus:ring-0 w-full min-w-0 p-3 bg-transparent"
                                                    required={
                                                        data.required
                                                    }
                                                />

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>


                            {/* ================= TERMS ================= */}

                            <div className="flex items-start gap-2 mt-5">

                                <input
                                    type="checkbox"
                                    required
                                    className="mt-0.5 cursor-pointer flex-shrink-0"
                                />

                                <p className="text-xs text-text leading-5">

                                    I Agree to MediStock's{" "}

                                    <Link
                                        to="#"
                                        className="text-primary hover:underline"
                                    >
                                        Terms Of Service
                                    </Link>

                                    {" "}and{" "}

                                    <Link
                                        to="#"
                                        className="text-primary hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>

                                </p>

                            </div>


                            {/* ================= SUBMIT ================= */}

                            <button
                                type="submit"
                                className="flex gap-2 items-center justify-center w-full p-3 mt-5 bg-primary text-white font-semibold cursor-pointer rounded-lg hover:bg-[#1b5ce9] hover:shadow transition"
                            >

                                Create Account

                                <ArrowRight className="h-5 w-5" />

                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>
    );
}
