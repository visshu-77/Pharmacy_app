import { Link } from "react-router-dom";
import LoginRegisterSidebar from "../components/loginRegisterSideBar";


export default function Login() {
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
                            <label className="font-bold text-xs text-text mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="focus:outline-none focus:ring-0 text-sm border rounded w-full p-3 mb-5"
                            />
                             <div className="flex gap-1 items-center w-full">
                                <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-text">I Agree to MediStock's <Link to='#' className="text-primary hover:underline">Terms Of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link></p>
                            </div>
                            <button className="text-center text-sm font-bold bg-primary w-full text-white p-3 mt-4 rounded hover:shadow-xl">Signin</button>
                        </form>
                        <div className="flex gap-3 items-center justify-between p-2">
                            <Link to='/forgotPassword' className="text-xs text-primary">Forgot Password?</Link>
                            <Link to='/register' className="text-xs text-primary">Create an Account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}