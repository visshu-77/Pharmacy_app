import { BrowserRouter, Route, Routes } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

import ProtectedRoute from "./components/ProtectedRoutes.jsx";

import ProfileCard from "./components/ProfileCard.jsx";
import Layout from "./layout.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Home.jsx";
import Product from './pages/Product.jsx';
import Category from './pages/Category.jsx'
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";
import Billing from "./pages/Billing.jsx";
import Settings from "./pages/Settings.jsx";
import Report from "./pages/Report.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import Subscription from "./pages/Subscription.jsx";
import SubscriptionCheckout from "./pages/SubscriptionCheckout.jsx";

import SubscriptionRoute from "./components/SubscriptionRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>
          <Route path='/' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Dashboard />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/product' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Product />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/category' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Category />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/billing' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Billing />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/settings' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Settings />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/reports' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Report />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/suppliers' element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <Suppliers />
              </SubscriptionRoute>
            </ProtectedRoute>
          } />
          <Route path='/subscription' element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          <Route path="/subscription/checkout" element={
            <ProtectedRoute>
              <SubscriptionCheckout />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgotPassword' element={<ForgotPassword />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;