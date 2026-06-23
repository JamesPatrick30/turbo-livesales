import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Demo from "../pages/Demo";

// Admin Pages
import AdminDashboard from "../pages/AdminPages/AdminDashboard";
import AdminOrders from "../pages/AdminPages/AdminOrders";
import AdminMenu from "../pages/AdminPages/AdminMenu";
import AdminAccounts from "../pages/AdminPages/AdminAccounts";

// Cashier Pages
import CashierDashboard from "../pages/CashierPages/CashierDashboard";

// Cook Pages
import CookDashboard from "../pages/CookPages/CookDashboard";
import CookHistory from "../pages/CookPages/CookHistory";

// Add more imports as needed
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo/admin" element={<AdminDashboard />} />
        <Route path="/demo/admin/orders" element={<AdminOrders />} />
        <Route path="/demo/admin/menu" element={<AdminMenu />} />
        <Route path="/demo/admin/accounts" element={<AdminAccounts />} />

        {/* Cashier Routes */}
        <Route path="/demo/cashier" element={<CashierDashboard />} />

        {/* Cook Routes */}
        <Route path="/demo/cook" element={<CookDashboard />} />
        <Route path="/demo/cook/history" element={<CookHistory />} />
      </Routes>
    </BrowserRouter>
  );
}