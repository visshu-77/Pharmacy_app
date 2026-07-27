import { Link } from "react-router-dom";
import LoginRegisterSidebar from "../components/loginRegisterSideBar";

export default function ForgotPassword() {
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
                        <form className="mt-10">
                            <label className="font-bold text-xs text-text mb-2">Phone / Email</label>
                            <input
                                type="text"
                                placeholder="Phone Number/Email"
                                required
                                className="focus:outline-none focus:ring-0 text-sm border rounded w-full p-3 mb-5"
                            />
                            <button className="text-center text-sm font-bold bg-primary w-full text-white p-3 rounded hover:shadow-xl">Generate OTP</button>
                        </form>
                        <div className="flex gap-3 items-center justify-between p-2">
                            <Link to='/login' className="text-xs text-primary">Login Page</Link>
                            <Link to='/register' className="text-xs text-primary">Create an Account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}