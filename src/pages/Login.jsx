import { Link, useNavigate } from "react-router-dom";
import LoginRegisterSidebar from "../components/loginRegisterSideBar";
import { registerUser, loginUser } from "../services/authService";
import { useEffect, useState } from "react";

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
]


export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/", { replace: true });
        }
    }, [navigate])

    const handleChnage = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await loginUser(formData);
            console.log(result);
             localStorage.setItem("token", result.token);
            alert('login successfull');
            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message || 'somethings went wrong'
            )
            console.log(err);
        }
    }

return (
        <div>
            <div className="flex">
                <div className="w-[20%]">
                    <LoginRegisterSidebar />
                </div>
                <div className="w-[80%] flex justify-center items-center">
                    <div className="border rounded p-10 flex flex-col shadow">
                        <h2 className="font-bold text-2xl text-center">Welcome to the dashboard</h2>
                        <p className="text-text text-sm mt-2 font-normal text-center">Signin to access your account</p>
                        <form className="mt-10"
                            onSubmit={handleSubmit}
                        >
                            {loginData.map((data) => {
                                return (
                                    <div>
                                        <label className="font-bold text-xs text-text mb-2">{data.label}</label>
                                        <input
                                            type={data.type}
                                            name={data.name}
                                            placeholder={data.placeholder}
                                            required={data.required}
                                            value={formData[data.name]}
                                            onChange={handleChnage}
                                            className="focus:outline-none focus:ring-0 text-sm border rounded w-full p-3 mb-5"
                                        />
                                    </div>
                                )
                            })}
                            <div className="flex gap-1 items-center w-full">
                                <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                    required
                                />
                                <p className="text-xs text-text">I Agree to MediStock's <Link to='#' className="text-primary hover:underline">Terms Of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link></p>
                            </div>
                            <button className="text-center text-sm font-bold bg-primary w-full text-white p-3 mt-4 rounded hover:shadow-xl">Signin</button>
                        </form>
                        <div className="flex gap-3 items-center justify-between p-2">
                            <Link to='/forgotPassword' className="text-xs text-primary">Forgot Password?</Link>
                            <Link to='/register' className="text-xs text-primary">Create an Account</Link>
                        </div>
                        <div>
                            {error && (
                                <p className="text-xs text-center text-red-400 mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}