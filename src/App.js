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

import PageNotFound from "./pages/PageNotFound.jsx";


// ================= ADMIN =================

import AdminLayout from "./admin/components/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminCustomers from "./admin/pages/AdminCustomer.jsx";
import AdminRoute from "./admin/AdminRoutes.jsx";
import UserRoute from "./components/UserRoute.jsx";

import AdminCustomerDetails from "./admin/pages/AdminCustomerDetails.jsx";
import EditCustomer from "./admin/pages/EditCustomer.jsx";


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
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Dashboard />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/product"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Product />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/category"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Category />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/billing"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Billing />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Settings />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Report />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/suppliers"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionRoute>
                                        <Suppliers />
                                    </SubscriptionRoute>
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/subscription"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <Subscription />
                                </UserRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/subscription/checkout"
                        element={
                            <ProtectedRoute>
                                <UserRoute>
                                    <SubscriptionCheckout />
                                </UserRoute>
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

                    <Route
                        path="customers/:id"
                        element={<AdminCustomerDetails />}
                    />

                    <Route 
                    path="customers/:id/edit"
                    element={<EditCustomer />}
                    />

                </Route>

                {/* ================= 404 ================= */}

                <Route
                    path="*"
                    element={<PageNotFound />}
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;