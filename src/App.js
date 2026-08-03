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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>
          <Route path='/' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/product' element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path='/category' element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          } />
          <Route path='/billing' element={
            <ProtectedRoute>
              <Billing />
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