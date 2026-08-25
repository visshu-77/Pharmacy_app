import { Link, useNavigate } from "react-router-dom";
import LoginRegisterSidebar from "../components/loginRegisterSideBar";
import { loginUser } from "../services/authService";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";

const loginData = [
    {
        id: 1,
        name: "email",
        type: "email",
        label: "Phone / Email",
        placeholder: "Phone Number / Email",
        required: true,
    },
    {
        id: 2,
        name: "password",
        type: "password",
        label: "Password",
        placeholder: "Password",
        required: true,
    }
];

export default function Login() {

    const navigate = useNavigate();
    const { fetchSubscription } = useSubscription();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            navigate("/", {
                replace: true
            });
        }
    }, [navigate]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setError("");

            const result = await loginUser(formData);

            localStorage.setItem(
                "token",
                result.token
            );
            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );
            await fetchSubscription();
            alert("Login successful");

            if (result.user?.role === "admin") {

                navigate("/admin", {
                    replace: true
                });

            } else {

                navigate("/", {
                    replace: true
                });

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

            console.log(err);
        }
    };


    return (

        <div className="w-full min-h-screen bg-white">

            <div className="w-full min-h-screen flex">


                {/* ================= SIDEBAR ================= */}

                <div className="hidden lg:block lg:w-[20%] lg:flex-shrink-0">

                    <LoginRegisterSidebar />

                </div>

                <div className="w-full lg:w-[80%] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-md">
                        <div className="border border-gray-200 rounded-xl p-5 sm:p-7 lg:p-10 shadow-sm bg-white">
                            <div className="text-center">
                                <h2 className="font-bold text-xl sm:text-2xl text-gray-900">
                                    Welcome to the dashboard
                                </h2>
                                <p className="text-text text-xs sm:text-sm mt-2 font-normal">
                                    Sign in to access your account
                                </p>
                            </div>

                            <form
                                className="mt-7 sm:mt-10"
                                onSubmit={handleSubmit}
                            >

                                {loginData.map((data) => {

                                    return (

                                        <div
                                            key={data.id}
                                            className="mb-4"
                                        >

                                            <label className="block font-bold text-xs text-text mb-2">

                                                {data.label}

                                            </label>

                                            <input
                                                type={data.type}
                                                name={data.name}
                                                placeholder={data.placeholder}
                                                required={data.required}
                                                value={formData[data.name]}
                                                onChange={handleChange}
                                                className="focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-200 rounded-lg w-full p-3 transition"
                                            />

                                        </div>

                                    );

                                })}

                                <div className="flex items-start gap-2 w-full mt-2">

                                    <input
                                        type="checkbox"
                                        className="cursor-pointer mt-0.5 flex-shrink-0"
                                        required
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

                                <button
                                    type="submit"
                                    className="text-center text-sm font-bold bg-primary w-full text-white p-3 mt-5 rounded-lg hover:shadow-xl hover:bg-[#1b5ce9] transition"
                                >

                                    Sign in

                                </button>


                            </form>

                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-5 pt-2">

                                <Link
                                    to="/forgotPassword"
                                    className="text-xs text-primary hover:underline"
                                >
                                    Forgot Password?
                                </Link>

                                <Link
                                    to="/register"
                                    className="text-xs text-primary hover:underline"
                                >
                                    Create an Account
                                </Link>

                            </div>

                            {error && (

                                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2">

                                    <p className="text-xs text-center text-red-500">

                                        {error}

                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
