import { BrowserRouter, Route, Routes } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

import ProfileCard from "./components/ProfileCard.jsx";
import Layout from "./layout.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Home.jsx";
import Product from './pages/Product.jsx';
import Category from './pages/Category.jsx'
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/product' element={<Product />} />
            <Route path='/category' element={<Category />} />
        </Route>
        
        <Route path="/register" element={<Register />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/forgotPassword' element={<ForgotPassword />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;