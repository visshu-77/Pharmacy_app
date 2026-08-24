  import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';

import ProtectedRoute from "./components/ProtectedRoutes.jsx";

import Layout from "./layout.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Home.jsx";
import Product from "./pages/Product.jsx";
import Category from "./pages/Category.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";
import Billing from "./pages/Billing.jsx";
import Settings from "./pages/Settings.jsx";
import Report from "./pages/Report.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import Subscription from "./pages/Subscription.jsx";
import SubscriptionCheckout from "./pages/SubscriptionCheckout.jsx";

import SubscriptionRoute from "./components/SubscriptionRoute.jsx";


// ================= ADMIN =================

import AdminLayout from "./admin/components/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminCustomers from "./admin/pages/AdminCustomers.jsx";
import AdminRoute from "./admin/AdminRoutes.jsx";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ================= CUSTOMER APP ================= */}

                <Route element={<Layout />}>

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Dashboard />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/product"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Product />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/category"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Category />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/billing"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Billing />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Settings />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Report />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/suppliers"
                        element={
                            <ProtectedRoute>
                                <SubscriptionRoute>
                                    <Suppliers />
                                </SubscriptionRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/subscription"
                        element={
                            <ProtectedRoute>
                                <Subscription />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/subscription/checkout"
                        element={
                            <ProtectedRoute>
                                <SubscriptionCheckout />
                            </ProtectedRoute>
                        }
                    />

                </Route>


                {/* ================= AUTH ================= */}

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/forgotPassword"
                    element={<ForgotPassword />}
                />


                {/* ================= ADMIN ================= */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        </ProtectedRoute>
                    }
                >

                    {/* /admin */}
                    <Route
                        index
                        element={<AdminDashboard />}
                    />

                    {/* /admin/customers */}
                    <Route
                        path="customers"
                        element={<AdminCustomers />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );
}

export default App;