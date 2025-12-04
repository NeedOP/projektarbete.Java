import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <div style={{
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: 'calc(100vh - 70px)'
            }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/admin/add-product" element={<AddProduct />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}